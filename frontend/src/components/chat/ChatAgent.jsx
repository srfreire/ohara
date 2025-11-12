import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, PanelLeftClose, PanelLeftOpen, RotateCcw } from 'lucide-react'
import { stream_chat } from '../../api/agent' // Updated to use .ts file
import { toast_error } from '../../utils/toast'
import MessageWithCitations from './MessageWithCitations'

const ChatAgent = ({ is_collapsed = false, on_toggle_collapse, selected_document_id = null, on_citation_click }) => {
  const [messages, set_messages] = useState([])
  const [input_value, set_input_value] = useState('')
  const [is_typing, set_is_typing] = useState(false)
  const [is_streaming, set_is_streaming] = useState(false)
  const [current_response, set_current_response] = useState('')
  const [current_citations, set_current_citations] = useState(null)
  const messages_end_ref = useRef(null)
  const abort_controller_ref = useRef(null)

  // Remove markdown image syntax from text
  const clean_markdown_images = (text) => {
    return text.replace(/!\[.*?\]\(.*?\)/g, '')
  }

  const scroll_to_bottom = () => {
    messages_end_ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scroll_to_bottom()
  }, [messages])

  const handle_send_message = async () => {
    if (!input_value.trim() || is_streaming) return

    const user_message = {
      id: Date.now().toString(),
      type: 'user',
      role: 'user',
      content: input_value.trim(),
      timestamp: new Date().toISOString(),
    }

    set_messages(prev => [...prev, user_message])
    const user_input = input_value.trim()
    set_input_value('')
    set_is_typing(true)
    set_is_streaming(true)
    set_current_response('')

    // Create assistant message placeholder
    const assistant_message_id = (Date.now() + 1).toString()

    // Prepare messages for API (only send role and content)
    const api_messages = [
      ...messages.map(msg => ({
        role: msg.role || msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      {
        role: 'user',
        content: user_input,
        timestamp: new Date().toISOString()
      }
    ]

    // Start streaming
    abort_controller_ref.current = stream_chat(api_messages, {
      model: 'gpt-4.1',
      document_id: selected_document_id,
      on_token: (token) => {
        console.log('📨 Received token:', { length: token.length, preview: token.substring(0, 50) })
        set_is_typing(false)
        set_current_response(prev => {
          const new_content = prev + token

          // Update the messages array with the current response
          set_messages(prev_messages => {
            const existing_index = prev_messages.findIndex(m => m.id === assistant_message_id)

            if (existing_index >= 0) {
              // Update existing message
              const updated = [...prev_messages]
              updated[existing_index] = {
                ...updated[existing_index],
                content: new_content
              }
              return updated
            } else {
              // Add new message
              return [...prev_messages, {
                id: assistant_message_id,
                type: 'assistant',
                role: 'assistant',
                content: new_content,
                timestamp: new Date().toISOString(),
                citations: null
              }]
            }
          })

          return new_content
        })
      },
      on_citations: (citations) => {
        console.log('📚 Received citations:', citations)
        set_current_citations(citations)
      },
      on_done: (citations) => {
        // Use citations parameter, or fall back to current_citations state
        set_current_citations(current_citations_state => {
          const final_citations = citations || current_citations_state

          // Update message with final citations
          if (final_citations && final_citations.length > 0) {
            set_messages(prev_messages => {
              const existing_index = prev_messages.findIndex(m => m.id === assistant_message_id)
              if (existing_index >= 0) {
                const updated = [...prev_messages]
                updated[existing_index] = {
                  ...updated[existing_index],
                  citations: final_citations
                }
                return updated
              }
              return prev_messages
            })
          }

          // Reset to null
          return null
        })

        set_is_typing(false)
        set_is_streaming(false)
        set_current_response('')
        abort_controller_ref.current = null
      },
      on_error: (error) => {
        console.error('Streaming error:', error)
        set_is_typing(false)
        set_is_streaming(false)
        set_current_response('')
        set_current_citations(null)
        abort_controller_ref.current = null

        // Show error message
        toast_error(error.message || 'Failed to get response from AI')

        // Add error message to chat
        set_messages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          citations: null
        }])
      }
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abort_controller_ref.current) {
        abort_controller_ref.current()
      }
    }
  }, [])

  const handle_refresh_chat = () => {
    // Abort any ongoing stream
    if (abort_controller_ref.current) {
      abort_controller_ref.current()
      abort_controller_ref.current = null
    }

    // Clear all state
    set_messages([])
    set_input_value('')
    set_is_typing(false)
    set_is_streaming(false)
    set_current_response('')
    set_current_citations(null)
  }

  const handle_key_press = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handle_send_message()
    }
  }

  return (
    <div className="h-full w-[400px] bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/80 dark:border-secondary-600/50 rounded-t-xl">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-text-light truncate font-sora">
                AI Assistant
              </h3>
              <p className="text-xs text-text-muted truncate font-reddit-sans">
                {is_typing ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handle_refresh_chat}
            disabled={is_streaming}
            className="p-2 rounded-lg text-text-muted hover:text-text-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Clear chat"
            title="Clear chat history"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {on_toggle_collapse && (
            <button
              onClick={on_toggle_collapse}
              className="p-2 rounded-lg text-text-muted hover:text-text-light transition-colors duration-200"
              aria-label={is_collapsed ? 'Expand chat' : 'Collapse chat'}
            >
              {is_collapsed ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeftOpen className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !is_typing && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-text-light mb-2 font-sora">
              AI Assistant
            </h3>
            <p className="text-text-muted font-reddit-sans max-w-sm">
              Ask me anything about your files and documents. I can help you search, analyze, and organize your content.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex space-x-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white p-3'
                  : 'text-text-light'
              }`}
            >
              {message.type === 'assistant' && message.citations ? (
                <MessageWithCitations
                  content={message.content}
                  citations={message.citations}
                  on_citation_click={on_citation_click}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap font-reddit-sans">
                  {message.type === 'assistant' ? clean_markdown_images(message.content) : message.content}
                </p>
              )}
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {is_typing && (
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/60 dark:bg-secondary-900/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messages_end_ref} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/80 dark:border-secondary-600/50 p-4">
        <div className="flex space-x-2">
          <textarea
            value={input_value}
            onChange={(e) => set_input_value(e.target.value)}
            onKeyPress={handle_key_press}
            placeholder="Ask about your files..."
            className="flex-1 resize-none rounded-lg border border-white/80 dark:border-secondary-600/50 bg-white/60 dark:bg-secondary-900/60 backdrop-blur-sm px-3 py-2 text-sm text-text-light placeholder-text-muted focus:border-primary-500 focus:outline-none font-reddit-sans"
            rows="1"
          />
          <button
            onClick={handle_send_message}
            disabled={!input_value.trim() || is_streaming}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-400 text-white p-2 rounded-lg transition-colors duration-200 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2 font-reddit-sans">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}

export default ChatAgent