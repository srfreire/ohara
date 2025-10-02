import { useState } from 'react'
import { User, Reply, Edit2, Trash2, MoreVertical } from 'lucide-react'
import CommentInput from './CommentInput'
import ReactionPicker from '../reactions/ReactionPicker'

const CommentItem = ({
  comment,
  current_user_id,
  current_user_name,
  reactions_map = {},
  replies = [],
  on_reply,
  on_edit,
  on_delete,
  on_react,
  on_unreact,
  depth = 0
}) => {
  // Get reactions for this specific comment
  const reactions = reactions_map[comment.id] || []
  const [is_replying, set_is_replying] = useState(false)
  const [is_editing, set_is_editing] = useState(false)
  const [show_menu, set_show_menu] = useState(false)
  const [is_loading, set_is_loading] = useState(false)

  const is_own_comment = comment.user_id === current_user_id
  const display_name = is_own_comment ? current_user_name : (comment.user_name || 'Anonymous User')
  const max_depth = 3 // Maximum nesting level

  const format_date = (date_string) => {
    const date = new Date(date_string)
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    } else if (days > 0) {
      return `${days}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return 'Just now'
    }
  }

  const handle_reply_submit = async (content) => {
    set_is_loading(true)
    try {
      await on_reply(comment.id, content)
      set_is_replying(false)
    } catch (error) {
      console.error('Failed to reply:', error)
    } finally {
      set_is_loading(false)
    }
  }

  const handle_edit_submit = async (content) => {
    set_is_loading(true)
    try {
      await on_edit(comment.id, content)
      set_is_editing(false)
    } catch (error) {
      console.error('Failed to edit:', error)
    } finally {
      set_is_loading(false)
    }
  }

  const handle_delete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    set_is_loading(true)
    try {
      await on_delete(comment.id)
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      set_is_loading(false)
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
      <div className="bg-white/60 dark:bg-secondary-900/60 backdrop-blur-sm rounded-lg
        border border-white/80 dark:border-secondary-600/50 p-4 transition-colors duration-200">

        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-light font-sora">
                {display_name}
              </p>
              <p className="text-xs text-text-muted font-reddit-sans">
                {format_date(comment.created_at)}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          {is_own_comment && (
            <div className="relative">
              <button
                onClick={() => set_show_menu(!show_menu)}
                className="p-1 rounded hover:bg-secondary-200 dark:hover:bg-secondary-700
                  text-text-muted transition-colors duration-200"
                aria-label="Comment options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {show_menu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-secondary-800
                  rounded-lg shadow-lg border border-white/80 dark:border-secondary-600/50
                  py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      set_is_editing(true)
                      set_show_menu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-text-light
                      hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors
                      flex items-center space-x-2 font-reddit-sans"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      handle_delete()
                      set_show_menu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600
                      hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors
                      flex items-center space-x-2 font-reddit-sans"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        {is_editing ? (
          <div className="mb-3">
            <CommentInput
              initial_value={comment.content}
              on_submit={handle_edit_submit}
              on_cancel={() => set_is_editing(false)}
              placeholder="Edit your comment..."
              is_reply={true}
              is_loading={is_loading}
            />
          </div>
        ) : (
          <p className="text-sm text-text-light mb-3 font-reddit-sans whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Reactions and Actions */}
        <div className="flex items-center justify-between">
          <ReactionPicker
            comment_id={comment.id}
            reactions={reactions}
            current_user_id={current_user_id}
            on_react={(reaction_type, existing_reaction_id) =>
              on_react(comment.id, reaction_type, existing_reaction_id)
            }
            on_unreact={on_unreact}
            is_loading={is_loading}
          />

          {depth < max_depth && (
            <button
              onClick={() => set_is_replying(!is_replying)}
              disabled={is_loading}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700
                dark:hover:text-primary-300 transition-colors flex items-center space-x-1
                font-reddit-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>

      {/* Reply Input */}
      {is_replying && (
        <div className="ml-8 mt-3">
          <CommentInput
            on_submit={handle_reply_submit}
            on_cancel={() => set_is_replying(false)}
            placeholder="Write a reply..."
            is_reply={true}
            is_loading={is_loading}
          />
        </div>
      )}

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              current_user_id={current_user_id}
              current_user_name={current_user_name}
              reactions_map={reactions_map}
              replies={reply.replies || []}
              on_reply={on_reply}
              on_edit={on_edit}
              on_delete={on_delete}
              on_react={on_react}
              on_unreact={on_unreact}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentItem
