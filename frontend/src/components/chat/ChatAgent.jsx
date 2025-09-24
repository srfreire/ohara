import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react'
import { mock_chat_messages } from '../../utils/mock-data'

const ChatAgent = () => {
  const [messages, set_messages] = useState(mock_chat_messages)
  const [input_value, set_input_value] = useState('')
  const [is_minimized, set_is_minimized] = useState(false)
  const [is_typing, set_is_typing] = useState(false)
  const messages_end_ref = useRef(null)

  const scroll_to_bottom = () => {
    messages_end_ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scroll_to_bottom()
  }, [messages])

  const handle_send_message = async () => {
    if (!input_value.trim()) return

    const user_message = {
      id: Date.now().toString(),
      type: 'user',
      content: input_value.trim(),
      timestamp: new Date().toISOString(),
    }

    set_messages(prev => [...prev, user_message])
    set_input_value('')
    set_is_typing(true)

    // Simulate AI response
    setTimeout(() => {
      const ai_response = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generate_mock_response(input_value),
        timestamp: new Date().toISOString(),
      }
      set_messages(prev => [...prev, ai_response])
      set_is_typing(false)
    }, 1000 + Math.random() * 2000)
  }

  const generate_mock_response = (user_input) => {
    const responses = [
      "I can help you navigate through your files and understand their contents. What would you like to know?",
      "Based on the files I can see, this appears to be a development project with React components and configuration files.",
      "I notice you have several folders including Documents, Projects, and Images. Would you like me to analyze any specific files?",
      "That's a great question! Let me look at your file structure to provide you with the most relevant information.",
      "I can help you understand the code in your files, explain configurations, or assist with file organization.",
    ]

    if (user_input.toLowerCase().includes('file') || user_input.toLowerCase().includes('folder')) {
      return "I can see your file structure. You have Documents, Projects (containing React Apps), Reports, and Images folders. Which specific files would you like me to help you with?"
    }

    if (user_input.toLowerCase().includes('code') || user_input.toLowerCase().includes('javascript')) {
      return "I can help you understand the code in your files. I see you have JavaScript configuration files and React components. Would you like me to explain any specific file?"
    }

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handle_key_press = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handle_send_message()
    }
  }

  const format_time = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`bg-background-surface border-l border-secondary-200 dark:border-secondary-700 flex flex-col transition-all duration-300 ${is_minimized ? 'w-12' : 'w-80'}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
        {!is_minimized && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-light">
                  AI Assistant
                </h3>
                <p className="text-xs text-text-muted">
                  {is_typing ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
          </>
        )}
        <button
          onClick={() => set_is_minimized(!is_minimized)}
          className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-text-muted transition-colors duration-200"
        >
          {is_minimized ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {!is_minimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 dark:bg-secondary-800 text-text-light'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'user'
                        ? 'text-primary-100'
                        : 'text-text-muted'
                    }`}
                  >
                    {format_time(message.timestamp)}
                  </p>
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
                <div className="bg-secondary-100 dark:bg-secondary-800 rounded-lg p-3">
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
          <div className="border-t border-secondary-200 dark:border-secondary-700 p-4">
            <div className="flex space-x-2">
              <textarea
                value={input_value}
                onChange={(e) => set_input_value(e.target.value)}
                onKeyPress={handle_key_press}
                placeholder="Ask about your files..."
                className="flex-1 resize-none rounded-lg border border-secondary-200 dark:border-secondary-700 bg-background-light px-3 py-2 text-sm text-text-light placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                rows="2"
              />
              <button
                onClick={handle_send_message}
                disabled={!input_value.trim() || is_typing}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-400 text-white p-2 rounded-lg transition-colors duration-200 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatAgent