import api_client from './client'

/**
 * Get all documents with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Max number of documents (default: 25, max: 100)
 * @param {number} params.offset - Offset for pagination (default: 0)
 * @param {string} params.folder_id - Filter by folder ID
 */
export const get_documents = async (params = {}) => {
  try {
    const response = await api_client.get('/documents', { params })
    return response.data
  } catch (error) {
    console.error('Get documents error:', error)
    throw error
  }
}

/**
 * Get document by ID
 * @param {string} id - Document ID
 */
export const get_document_by_id = async (id) => {
  try {
    const response = await api_client.get(`/documents/${id}`)
    return response.data
  } catch (error) {
    console.error('Get document by ID error:', error)
    throw error
  }
}

/**
 * Create new document
 * @param {Object} document_data - Document data
 */
export const create_document = async (document_data) => {
  try {
    const response = await api_client.post('/documents', document_data)
    return response.data
  } catch (error) {
    console.error('Create document error:', error)
    throw error
  }
}

/**
 * Update document
 * @param {string} id - Document ID
 * @param {Object} document_data - Updated document data
 */
export const update_document = async (id, document_data) => {
  try {
    const response = await api_client.put(`/documents/${id}`, document_data)
    return response.data
  } catch (error) {
    console.error('Update document error:', error)
    throw error
  }
}

/**
 * Delete document
 * @param {string} id - Document ID
 */
export const delete_document = async (id) => {
  try {
    const response = await api_client.delete(`/documents/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete document error:', error)
    throw error
  }
}
