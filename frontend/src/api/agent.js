/**
 * Agent API Service
 * Handles SSE (Server-Sent Events) streaming for chat
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1'

/**
 * Stream chat messages using Server-Sent Events
 * @param {Array} messages - Array of message objects with role, content, timestamp
 * @param {string} model - Model to use (default: gpt-4.1)
 * @param {Function} on_token - Callback for each token received
 * @param {Function} on_done - Callback when stream is complete
 * @param {Function} on_error - Callback for errors
 * @returns {Function} abort function to cancel the stream
 */
export const stream_chat = async (messages, options = {}) => {
  const {
    model = 'gpt-4.1',
    on_token = () => {},
    on_done = () => {},
    on_error = () => {},
  } = options

  // Get JWT token from localStorage
  const access_token = localStorage.getItem('access_token')

  if (!access_token) {
    on_error(new Error('No access token found. Please login.'))
    return () => {}
  }

  let controller = new AbortController()

  try {
    const response = await fetch(`${API_BASE_URL}/agent/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        messages,
        model,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const error_data = await response.json().catch(() => ({}))
      throw new Error(error_data.message || `HTTP error! status: ${response.status}`)
    }

    // Read the response as a stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    // Process the stream
    const process_stream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            on_done()
            break
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true })

          // Split by newlines to handle multiple SSE messages
          const lines = chunk.split('\n')

          for (const line of lines) {
            // SSE format: "data: <json>"
            if (line.startsWith('data: ')) {
              const data_str = line.slice(6).trim()

              if (!data_str) continue

              try {
                const data = JSON.parse(data_str)

                if (data.type === 'token' && data.content) {
                  // Legacy token-by-token streaming
                  on_token(data.content)
                } else if (data.type === 'response' && data.content) {
                  // Structured response from agent (contains text, citations, files)
                  const response_text = typeof data.content === 'string'
                    ? data.content
                    : data.content.text || JSON.stringify(data.content)
                  console.log('✅ Received final response:', { text_length: response_text.length, preview: response_text.substring(0, 100) })

                  // Send the full text at once
                  on_token(response_text)

                  // Mark as done
                  on_done()
                  return
                } else if (data.type === 'action') {
                  // Tool calls - log for debugging but don't display yet
                  console.log('🔧 Agent calling tools:', data.content)
                } else if (data.type === 'observation') {
                  // Tool results - log for debugging but don't display yet
                  console.log('📊 Tool results:', data.content)
                } else if (data.type === 'thought') {
                  // Agent thinking - log for debugging but don't display yet
                  console.log('💭 Agent thinking:', data.content)
                } else if (data.type === 'done') {
                  on_done()
                  return
                } else if (data.type === 'error') {
                  on_error(new Error(data.content || data.message || 'Stream error'))
                  return
                }
              } catch (parse_error) {
                console.error('Failed to parse SSE data:', parse_error, data_str)
              }
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          on_error(error)
        }
      }
    }

    // Start processing the stream
    process_stream()

  } catch (error) {
    if (error.name !== 'AbortError') {
      on_error(error)
    }
  }

  // Return abort function
  return () => {
    controller.abort()
  }
}

/**
 * Send a single chat message (non-streaming)
 * @param {Array} messages - Array of message objects
 * @param {string} model - Model to use
 * @returns {Promise} Response data
 */
export const send_chat_message = async (messages, model = 'gpt-4.1') => {
  const access_token = localStorage.getItem('access_token')

  if (!access_token) {
    throw new Error('No access token found. Please login.')
  }

  const response = await fetch(`${API_BASE_URL}/agent/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      messages,
      model,
    }),
  })

  if (!response.ok) {
    const error_data = await response.json().catch(() => ({}))
    throw new Error(error_data.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}
