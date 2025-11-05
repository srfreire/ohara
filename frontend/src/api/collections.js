import api_client from './client'

/**
 * Get all collections
 * Requires authentication
 */
export const get_collections = async () => {
  try {
    const response = await api_client.get('/collections')
    return response.data
  } catch (error) {
    console.error('Get collections error:', error)
    throw error
  }
}

/**
 * Get collection by ID
 * @param {string} id - Collection ID
 */
export const get_collection_by_id = async (id) => {
  try {
    const response = await api_client.get(`/collections/${id}`)
    return response.data
  } catch (error) {
    console.error('Get collection by ID error:', error)
    throw error
  }
}

/**
 * Create new collection
 * @param {Object} collection_data - Collection data
 * @param {string} collection_data.name - Collection name
 * @param {string} collection_data.user_id - User ID
 * @param {string} collection_data.description - Optional description
 * @param {string} collection_data.visibility - Visibility: private, unlisted, public (default: private)
 */
export const create_collection = async (collection_data) => {
  try {
    const response = await api_client.post('/collections', collection_data)
    return response.data
  } catch (error) {
    console.error('Create collection error:', error)
    throw error
  }
}

/**
 * Update collection
 * @param {string} id - Collection ID
 * @param {Object} collection_data - Updated collection data
 */
export const update_collection = async (id, collection_data) => {
  try {
    const response = await api_client.put(`/collections/${id}`, collection_data)
    return response.data
  } catch (error) {
    console.error('Update collection error:', error)
    throw error
  }
}

/**
 * Delete collection
 * @param {string} id - Collection ID
 */
export const delete_collection = async (id) => {
  try {
    const response = await api_client.delete(`/collections/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete collection error:', error)
    throw error
  }
}

/**
 * Get items in a collection
 * @param {string} id - Collection ID
 */
export const get_collection_items = async (id) => {
  try {
    const response = await api_client.get(`/collections/${id}/items`)
    return response.data
  } catch (error) {
    console.error('Get collection items error:', error)
    throw error
  }
}

/**
 * Add item to collection
 * @param {string} id - Collection ID
 * @param {string} document_id - Document ID to add
 */
export const add_item_to_collection = async (id, document_id) => {
  try {
    console.log('=== ADD ITEM TO COLLECTION ===')
    console.log('Collection ID:', id)
    console.log('Document ID:', document_id)
    console.log('Document ID type:', typeof document_id)
    console.log('Payload being sent:', JSON.stringify({ document_id }))

    const response = await api_client.post(`/collections/${id}/items`, { document_id })
    console.log('Add item response:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Add item to collection error:', error)
    console.error('Full error object:', JSON.stringify(error.response?.data, null, 2))
    console.error('Error response data:', error.response?.data)
    console.error('Error status:', error.response?.status)
    console.error('Request config:', error.config)
    throw error
  }
}

/**
 * Remove item from collection
 * @param {string} collection_id - Collection ID
 * @param {string} item_id - Item ID to remove
 */
export const remove_item_from_collection = async (collection_id, item_id) => {
  try {
    const response = await api_client.delete(`/collections/${collection_id}/items/${item_id}`)
    return response.data
  } catch (error) {
    console.error('Remove item from collection error:', error)
    throw error
  }
}
