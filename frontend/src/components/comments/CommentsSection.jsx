import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { get_comments, create_comment, update_comment, delete_comment } from '../../api/comments' // Updated to use .ts file
import { get_reactions, create_reaction, delete_reaction } from '../../api/reactions' // Updated to use .ts file
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

  // Helper: Generate temporary ID for optimistic updates
  const generate_temp_id = () => `temp_${Date.now()}_${Math.random()}`

  // Helper: Add comment to tree structure
  const add_comment_to_tree = (tree, new_comment, parent_id = null) => {
    if (!parent_id) {
      // Add as root comment
      return [...tree, { ...new_comment, replies: [] }]
    }

    // Add as reply to parent
    return tree.map(comment => {
      if (comment.id === parent_id) {
        return {
          ...comment,
          replies: [...(comment.replies || []), { ...new_comment, replies: [] }]
        }
      }
      if (comment.replies?.length > 0) {
        return {
          ...comment,
          replies: add_comment_to_tree(comment.replies, new_comment, parent_id)
        }
      }
      return comment
    })
  }

  // Helper: Update comment in tree structure
  const update_comment_in_tree = (tree, comment_id, updates) => {
    return tree.map(comment => {
      if (comment.id === comment_id) {
        return { ...comment, ...updates }
      }
      if (comment.replies?.length > 0) {
        return {
          ...comment,
          replies: update_comment_in_tree(comment.replies, comment_id, updates)
        }
      }
      return comment
    })
  }

  // Helper: Delete comment from tree structure
  const delete_comment_from_tree = (tree, comment_id) => {
    return tree.filter(comment => {
      if (comment.id === comment_id) return false
      if (comment.replies?.length > 0) {
        comment.replies = delete_comment_from_tree(comment.replies, comment_id)
      }
      return true
    })
  }

  // Load comments and reactions
  useEffect(() => {
    if (document_id) {
      load_comments()
    }
  }, [document_id])

  const load_comments = async () => {
    try {
      set_is_loading(true)
      // v2 API: Use cursor pagination, fetch with high limit
      const [comments_result, reactions_result] = await Promise.all([
        get_comments({ documentId: document_id, limit: 100 }),
        get_reactions({ commentId: undefined, limit: 100 }) // Get all reactions for comments
      ])

      // Extract data from v2 response format
      const comments_data = comments_result.comments
      const reactions_data = reactions_result.reactions

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

    // Create optimistic comment
    const temp_id = generate_temp_id()
    const optimistic_comment = {
      id: temp_id,
      document_id,
      user_id: user.id,
      user_name: user.name,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_comment_id: null,
      start_offset: 0,
      end_offset: 1,
      replies: []
    }

    // Optimistically add to state
    set_comments(prev => add_comment_to_tree(prev, optimistic_comment))

    try {
      // Make API call
      const created_comment = await create_comment({
        document_id,
        user_id: user.id,
        content,
        start_offset: 0,
        end_offset: 1
      })

      // Replace temp comment with real one
      set_comments(prev => {
        const without_temp = delete_comment_from_tree(prev, temp_id)
        return add_comment_to_tree(without_temp, created_comment)
      })

      toast_success('Comment posted successfully')
    } catch (error) {
      // Rollback on error
      set_comments(prev => delete_comment_from_tree(prev, temp_id))
      console.error('Failed to create comment:', error)
      toast_error('Failed to post comment')
    }
  }

  // Reply to a comment
  const handle_reply = async (parent_comment_id, content) => {
    if (!user) {
      toast_error('You must be logged in to reply')
      return
    }

    // Create optimistic reply
    const temp_id = generate_temp_id()
    const optimistic_reply = {
      id: temp_id,
      document_id,
      user_id: user.id,
      user_name: user.name,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_comment_id,
      start_offset: 0,
      end_offset: 1,
      replies: []
    }

    // Optimistically add to state
    set_comments(prev => add_comment_to_tree(prev, optimistic_reply, parent_comment_id))

    try {
      // Make API call
      const created_reply = await create_comment({
        document_id,
        user_id: user.id,
        content,
        parent_comment_id,
        start_offset: 0,
        end_offset: 1
      })

      // Replace temp reply with real one
      set_comments(prev => {
        const without_temp = delete_comment_from_tree(prev, temp_id)
        return add_comment_to_tree(without_temp, created_reply, parent_comment_id)
      })

      toast_success('Reply posted successfully')
    } catch (error) {
      // Rollback on error
      set_comments(prev => delete_comment_from_tree(prev, temp_id))
      console.error('Failed to reply:', error)
      toast_error('Failed to post reply')
    }
  }

  // Edit a comment
  const handle_edit = async (comment_id, content) => {
    // Save old content for rollback
    let old_content = null
    set_comments(prev => {
      const find_comment = (tree) => {
        for (const comment of tree) {
          if (comment.id === comment_id) return comment
          if (comment.replies?.length > 0) {
            const found = find_comment(comment.replies)
            if (found) return found
          }
        }
        return null
      }
      const comment = find_comment(prev)
      if (comment) old_content = comment.content
      return prev
    })

    // Optimistically update
    set_comments(prev => update_comment_in_tree(prev, comment_id, {
      content,
      updated_at: new Date().toISOString()
    }))

    try {
      // Make API call
      await update_comment(comment_id, { content })
      toast_success('Comment updated successfully')
    } catch (error) {
      // Rollback on error
      if (old_content !== null) {
        set_comments(prev => update_comment_in_tree(prev, comment_id, {
          content: old_content
        }))
      }
      console.error('Failed to edit comment:', error)
      toast_error('Failed to update comment')
    }
  }

  // Delete a comment
  const handle_delete = async (comment_id) => {
    // Save old state for rollback
    let old_comments = null
    set_comments(prev => {
      old_comments = prev
      return prev
    })

    // Optimistically delete
    set_comments(prev => delete_comment_from_tree(prev, comment_id))

    try {
      // Make API call
      await delete_comment(comment_id)
      toast_success('Comment deleted successfully')
    } catch (error) {
      // Rollback on error
      if (old_comments) {
        set_comments(old_comments)
      }
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

    // Save old state for rollback
    const old_reactions_map = { ...reactions_map }
    const temp_id = generate_temp_id()

    // Optimistically update reactions
    set_reactions_map(prev => {
      const comment_reactions = [...(prev[comment_id] || [])]

      if (existing_reaction_id) {
        // Remove old reaction and add new one
        const filtered = comment_reactions.filter(r => r.id !== existing_reaction_id)
        filtered.push({
          id: temp_id,
          comment_id,
          user_id: user.id,
          reaction_type,
          created_at: new Date().toISOString()
        })
        return { ...prev, [comment_id]: filtered }
      } else {
        // Add new reaction
        comment_reactions.push({
          id: temp_id,
          comment_id,
          user_id: user.id,
          reaction_type,
          created_at: new Date().toISOString()
        })
        return { ...prev, [comment_id]: comment_reactions }
      }
    })

    try {
      let created_reaction
      if (existing_reaction_id) {
        // Delete old reaction and create new one
        await delete_reaction(existing_reaction_id)
        created_reaction = await create_reaction({
          comment_id,
          user_id: user.id,
          reaction_type
        })
      } else {
        // Create new reaction
        created_reaction = await create_reaction({
          comment_id,
          user_id: user.id,
          reaction_type
        })
      }

      // Replace temp reaction with real one
      set_reactions_map(prev => {
        const comment_reactions = [...(prev[comment_id] || [])]
        const filtered = comment_reactions.filter(r => r.id !== temp_id)
        filtered.push(created_reaction)
        return { ...prev, [comment_id]: filtered }
      })
    } catch (error) {
      // Rollback on error
      set_reactions_map(old_reactions_map)
      console.error('Failed to react:', error)
      toast_error('Failed to add reaction')
    }
  }

  // Remove reaction
  const handle_unreact = async (reaction_id) => {
    // Save old state for rollback
    const old_reactions_map = { ...reactions_map }

    // Find which comment this reaction belongs to
    let target_comment_id = null
    for (const [comment_id, reactions] of Object.entries(reactions_map)) {
      if (reactions.some(r => r.id === reaction_id)) {
        target_comment_id = comment_id
        break
      }
    }

    if (!target_comment_id) return

    // Optimistically remove reaction
    set_reactions_map(prev => {
      const comment_reactions = [...(prev[target_comment_id] || [])]
      const filtered = comment_reactions.filter(r => r.id !== reaction_id)
      return { ...prev, [target_comment_id]: filtered }
    })

    try {
      // Make API call
      await delete_reaction(reaction_id)
    } catch (error) {
      // Rollback on error
      set_reactions_map(old_reactions_map)
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
