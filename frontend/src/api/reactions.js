import api_client from './client'

/**
 * Get reactions for a comment or document
 * @param {Object} filters - Filter options
 * @param {string} filters.comment_id - Comment ID to filter by
 * @param {string} filters.document_id - Document ID to filter by
 * @param {number} filters.limit - Maximum number of reactions to return
 * @param {number} filters.offset - Offset for pagination
 * @returns {Promise<Array>} List of reactions
 */
export const get_reactions = async (filters = {}) => {
  const params = {
    limit: filters.limit || 25,
    offset: filters.offset || 0
  }

  if (filters.comment_id) {
    params.commentId = filters.comment_id
  }
  if (filters.document_id) {
    params.documentId = filters.document_id
  }

  const response = await api_client.get('/reactions', { params })
  return response.data
}

/**
 * Create a reaction
 * @param {Object} reaction_data - Reaction data
 * @param {string} reaction_data.user_id - User ID
 * @param {string} reaction_data.comment_id - Comment ID (required)
 * @param {string} reaction_data.reaction_type - Reaction type ('like', 'love', 'insight', 'question', 'flag')
 * @returns {Promise<Object>} Created reaction
 */
export const create_reaction = async (reaction_data) => {
  const response = await api_client.post('/reactions', reaction_data)
  return response.data
}

/**
 * Update a reaction
 * @param {string} reaction_id - Reaction ID
 * @param {Object} update_data - Data to update
 * @param {string} update_data.reaction_type - Updated reaction type
 * @returns {Promise<Object>} Updated reaction
 */
export const update_reaction = async (reaction_id, update_data) => {
  const response = await api_client.put(`/reactions/${reaction_id}`, update_data)
  return response.data
}

/**
 * Delete a reaction
 * @param {string} reaction_id - Reaction ID
 * @returns {Promise<Object>} Delete confirmation
 */
export const delete_reaction = async (reaction_id) => {
  const response = await api_client.delete(`/reactions/${reaction_id}`)
  return response.data
}

/**
 * Reaction type constants
 */
export const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  INSIGHT: 'insight',
  QUESTION: 'question',
  FLAG: 'flag'
}

/**
 * Get emoji for reaction type
 */
export const get_reaction_emoji = (reaction_type) => {
  const emoji_map = {
    like: '👍',
    love: '❤️',
    insight: '💡',
    question: '❓',
    flag: '🚩'
  }
  return emoji_map[reaction_type] || '👍'
}
