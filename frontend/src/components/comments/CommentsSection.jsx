import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { get_comments, create_comment, update_comment, delete_comment } from '../../api/comments'
import { get_reactions, create_reaction, delete_reaction } from '../../api/reactions'
import { toast_error, toast_success } from '../../utils/toast'
import { useAuth } from '../../contexts/auth-context'
import CommentInput from './CommentInput'
import CommentItem from './CommentItem'
import LoadingSpinner from '../ui/LoadingSpinner'

const CommentsSection = ({ document_id }) => {
  const { user } = useAuth()
  const [comments, set_comments] = useState([])
  const [reactions_map, set_reactions_map] = useState({})
  const [is_loading, set_is_loading] = useState(true)
  const [is_posting, set_is_posting] = useState(false)

  // Load comments and reactions
  useEffect(() => {
    if (document_id) {
      load_comments()
    }
  }, [document_id])

  const load_comments = async () => {
    try {
      set_is_loading(true)
      const [comments_data, reactions_data] = await Promise.all([
        get_comments(document_id),
        get_reactions({ document_id })
      ])

      // Build comment tree
      const comment_tree = build_comment_tree(comments_data)
      set_comments(comment_tree)

      // Group reactions by comment_id
      const reactions_by_comment = {}
      reactions_data.forEach(reaction => {
        if (!reactions_by_comment[reaction.comment_id]) {
          reactions_by_comment[reaction.comment_id] = []
        }
        reactions_by_comment[reaction.comment_id].push(reaction)
      })
      set_reactions_map(reactions_by_comment)
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast_error('Failed to load comments')
    } finally {
      set_is_loading(false)
    }
  }

  // Build hierarchical comment tree
  const build_comment_tree = (flat_comments) => {
    const comment_map = {}
    const root_comments = []

    // Sort comments by created_at (oldest first)
    const sorted_comments = [...flat_comments].sort((a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
    )

    // First pass: create map of all comments
    sorted_comments.forEach(comment => {
      comment_map[comment.id] = { ...comment, replies: [] }
    })

    // Second pass: build tree structure
    sorted_comments.forEach(comment => {
      if (comment.parent_comment_id && comment_map[comment.parent_comment_id]) {
        comment_map[comment.parent_comment_id].replies.push(comment_map[comment.id])
      } else {
        root_comments.push(comment_map[comment.id])
      }
    })

    // Replies are already sorted since we sorted the flat array
    return root_comments
  }

  // Create a new comment
  const handle_create_comment = async (content) => {
    if (!user) {
      toast_error('You must be logged in to comment')
      return
    }

    try {
      set_is_posting(true)
      await create_comment({
        document_id,
        user_id: user.id,
        content,
        start_offset: 0,
        end_offset: 1
      })
      toast_success('Comment posted successfully')
      await load_comments()
    } catch (error) {
      console.error('Failed to create comment:', error)
      toast_error('Failed to post comment')
    } finally {
      set_is_posting(false)
    }
  }

  // Reply to a comment
  const handle_reply = async (parent_comment_id, content) => {
    if (!user) {
      toast_error('You must be logged in to reply')
      return
    }

    try {
      await create_comment({
        document_id,
        user_id: user.id,
        content,
        parent_comment_id,
        start_offset: 0,
        end_offset: 1
      })
      toast_success('Reply posted successfully')
      await load_comments()
    } catch (error) {
      console.error('Failed to reply:', error)
      toast_error('Failed to post reply')
    }
  }

  // Edit a comment
  const handle_edit = async (comment_id, content) => {
    try {
      await update_comment(comment_id, { content })
      toast_success('Comment updated successfully')
      await load_comments()
    } catch (error) {
      console.error('Failed to edit comment:', error)
      toast_error('Failed to update comment')
    }
  }

  // Delete a comment
  const handle_delete = async (comment_id) => {
    try {
      await delete_comment(comment_id)
      toast_success('Comment deleted successfully')
      await load_comments()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast_error('Failed to delete comment')
    }
  }

  // React to a comment
  const handle_react = async (comment_id, reaction_type, existing_reaction_id) => {
    if (!user) {
      toast_error('You must be logged in to react')
      return
    }

    try {
      if (existing_reaction_id) {
        // Delete old reaction and create new one (more reliable than update)
        await delete_reaction(existing_reaction_id)
        await create_reaction({
          comment_id,
          user_id: user.id,
          reaction_type
        })
      } else {
        // Create new reaction
        await create_reaction({
          comment_id,
          user_id: user.id,
          reaction_type
        })
      }
      await load_comments()
    } catch (error) {
      console.error('Failed to react:', error)
      toast_error('Failed to add reaction')
    }
  }

  // Remove reaction
  const handle_unreact = async (reaction_id) => {
    try {
      await delete_reaction(reaction_id)
      await load_comments()
    } catch (error) {
      console.error('Failed to unreact:', error)
      toast_error('Failed to remove reaction')
    }
  }

  if (is_loading) {
    return (
      <div className="h-full bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm rounded-xl
        shadow-lg p-6 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  return (
    <div className="h-full bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/80 dark:border-secondary-600/50">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-text-light font-sora">
            Comments
          </h2>
          <span className="text-sm text-text-muted font-reddit-sans">
            ({comments.length})
          </span>
        </div>
      </div>

      {/* New Comment Input */}
      <div className="px-6 py-4 border-b border-white/80 dark:border-secondary-600/50">
        <CommentInput
          on_submit={handle_create_comment}
          placeholder="Write a comment..."
          is_loading={is_posting}
        />
      </div>

      {/* Comments List */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted font-reddit-sans">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                current_user_id={user?.id}
                current_user_name={user?.name}
                reactions_map={reactions_map}
                replies={comment.replies || []}
                on_reply={handle_reply}
                on_edit={handle_edit}
                on_delete={handle_delete}
                on_react={handle_react}
                on_unreact={handle_unreact}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentsSection
