import { useState } from 'react'
import { Send, X } from 'lucide-react'

const CommentInput = ({
  on_submit,
  on_cancel,
  initial_value = '',
  placeholder = 'Write a comment...',
  is_reply = false,
  is_loading = false
}) => {
  const [content, set_content] = useState(initial_value)
  const max_length = 1000

  const handle_submit = () => {
    if (!content.trim() || is_loading) return
    on_submit(content.trim())
    set_content('')
  }

  const handle_key_press = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handle_submit()
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => set_content(e.target.value)}
          onKeyPress={handle_key_press}
          placeholder={placeholder}
          maxLength={max_length}
          disabled={is_loading}
          className={`w-full resize-none rounded-lg border border-white/80 dark:border-secondary-600/50
            bg-white/60 dark:bg-secondary-900/60 backdrop-blur-sm px-4 py-3 text-sm
            text-text-light placeholder-text-muted focus:border-primary-500 focus:outline-none
            font-reddit-sans transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${is_reply ? 'min-h-[80px]' : 'min-h-[100px]'}`}
          rows={is_reply ? 3 : 4}
        />
        <div className="absolute bottom-2 right-2 text-xs text-text-muted font-reddit-sans">
          {content.length}/{max_length}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted font-reddit-sans">
          Press Enter to submit, Shift + Enter for new line
        </p>
        <div className="flex items-center space-x-2">
          {on_cancel && (
            <button
              onClick={on_cancel}
              disabled={is_loading}
              className="px-4 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-700
                hover:bg-secondary-200 dark:hover:bg-secondary-600 text-text-light
                transition-colors duration-200 text-sm font-reddit-sans
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
          <button
            onClick={handle_submit}
            disabled={!content.trim() || is_loading}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700
              disabled:bg-secondary-400 disabled:cursor-not-allowed text-white
              transition-colors duration-200 text-sm font-reddit-sans flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{is_loading ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentInput
