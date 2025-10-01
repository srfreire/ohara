import api_client from './client'

/**
 * Get comments for a document
 * @param {string} document_id - Document ID to filter by
 * @param {number} limit - Maximum number of comments to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of comments
 */
export const get_comments = async (document_id, limit = 25, offset = 0) => {
  const params = { limit, offset }
  if (document_id) {
    params.documentId = document_id
  }

  const response = await api_client.get('/comments', { params })
  return response.data
}

/**
 * Create a new comment
 * @param {Object} comment_data - Comment data
 * @param {string} comment_data.document_id - Document ID
 * @param {string} comment_data.user_id - User ID
 * @param {string} comment_data.content - Comment content
 * @param {string} comment_data.parent_comment_id - Parent comment ID (optional, for replies)
 * @param {number} comment_data.start_offset - Start offset in document text (optional)
 * @param {number} comment_data.end_offset - End offset in document text (optional)
 * @returns {Promise<Object>} Created comment
 */
export const create_comment = async (comment_data) => {
  const response = await api_client.post('/comments', comment_data)
  return response.data
}

/**
 * Update a comment
 * @param {string} comment_id - Comment ID
 * @param {Object} update_data - Data to update
 * @param {string} update_data.content - Updated comment content
 * @returns {Promise<Object>} Updated comment
 */
export const update_comment = async (comment_id, update_data) => {
  const response = await api_client.put(`/comments/${comment_id}`, update_data)
  return response.data
}

/**
 * Delete a comment
 * @param {string} comment_id - Comment ID
 * @returns {Promise<Object>} Delete confirmation
 */
export const delete_comment = async (comment_id) => {
  const response = await api_client.delete(`/comments/${comment_id}`)
  return response.data
}
