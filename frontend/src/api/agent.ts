/**
 * Agent API Service
 * Handles SSE (Server-Sent Events) streaming for chat
 */

import type { ChatMessage, ChatStreamRequest } from '../types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_VERSION = 'v2' // Updated to v2
const API_BASE_URL = `${BASE_URL}/${API_VERSION}`

/**
 * SSE stream event types
 */
interface SSETokenEvent {
  type: 'token'
  content: string
}

interface SSEResponseEvent {
  type: 'response'
  content: string | {
    text?: string
    content?: string
    citations?: any[]
  }
}

interface SSEActionEvent {
  type: 'action'
  content: any
}

interface SSEObservationEvent {
  type: 'observation'
  content: any
}

interface SSEThoughtEvent {
  type: 'thought'
  content: any
}

interface SSEDoneEvent {
  type: 'done'
}

interface SSEErrorEvent {
  type: 'error'
  content?: string
  message?: string
}

type SSEEvent = SSETokenEvent | SSEResponseEvent | SSEActionEvent | SSEObservationEvent | SSEThoughtEvent | SSEDoneEvent | SSEErrorEvent

/**
 * Options for stream_chat
 */
interface StreamChatOptions {
  model?: string
  document_id?: string | null
  on_token?: (token: string) => void
  on_done?: (citations?: any[] | null) => void
  on_error?: (error: Error) => void
  on_citations?: (citations: any[]) => void
}

/**
 * Stream chat messages using Server-Sent Events
 * POST /v2/agent/stream
 */
export const stream_chat = async (messages: ChatMessage[], options: StreamChatOptions = {}): Promise<() => void> => {
  const {
    model = 'gpt-4.1',
    document_id = null,
    on_token = () => {},
    on_done = () => {},
    on_error = () => {},
    on_citations = () => {},
  } = options

  // Get JWT token from localStorage
  const access_token = localStorage.getItem('access_token')

  if (!access_token) {
    on_error(new Error('No access token found. Please login.'))
    return () => {}
  }

  const controller = new AbortController()

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
        ...(document_id && { document_id }),
      } as ChatStreamRequest),
      signal: controller.signal,
    })

    if (!response.ok) {
      const error_data = await response.json().catch(() => ({}))
      throw new Error(error_data.message || `HTTP error! status: ${response.status}`)
    }

    // Read the response as a stream
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to get response reader')
    }

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
                const data = JSON.parse(data_str) as SSEEvent

                if (data.type === 'token' && data.content) {
                  // Legacy token-by-token streaming
                  on_token(data.content)
                } else if (data.type === 'response' && data.content) {
                  // Structured response from agent (contains text, citations, files)
                  let response_text = ''
                  let citations: any[] | null = null

                  if (typeof data.content === 'string') {
                    response_text = data.content
                  } else if (typeof data.content === 'object') {
                    response_text = data.content.text || data.content.content || JSON.stringify(data.content)
                    citations = data.content.citations || null
                  }

                  console.log('✅ Received final response:', {
                    text_length: response_text.length,
                    preview: response_text.substring(0, 100),
                    citations_count: citations ? citations.length : 0
                  })

                  // Send citations if available
                  if (citations && citations.length > 0) {
                    on_citations(citations)
                  }

                  // Send the full text at once
                  on_token(response_text)

                  // Mark as done (pass citations)
                  on_done(citations)
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
        if ((error as any).name !== 'AbortError') {
          on_error(error as Error)
        }
      }
    }

    // Start processing the stream
    process_stream()

  } catch (error) {
    if ((error as any).name !== 'AbortError') {
      on_error(error as Error)
    }
  }

  // Return abort function
  return () => {
    controller.abort()
  }
}

/**
 * Send a single chat message (non-streaming)
 * POST /v2/agent/chat
 */
export const send_chat_message = async (messages: ChatMessage[], model: string = 'gpt-4.1'): Promise<any> => {
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
