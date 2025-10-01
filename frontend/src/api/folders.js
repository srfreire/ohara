import api_client from './client'

/**
 * Get all folders with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Max number of folders (default: 25, max: 100)
 * @param {number} params.offset - Offset for pagination (default: 0)
 * @param {string} params.parent_id - Filter by parent folder ID
 */
export const get_folders = async (params = {}) => {
  try {
    const response = await api_client.get('/folders', { params })
    return response.data
  } catch (error) {
    console.error('Get folders error:', error)
    throw error
  }
}

/**
 * Get folder by ID
 * @param {string} id - Folder ID
 */
export const get_folder_by_id = async (id) => {
  try {
    const response = await api_client.get(`/folders/${id}`)
    return response.data
  } catch (error) {
    console.error('Get folder by ID error:', error)
    throw error
  }
}

/**
 * Create new folder
 * @param {Object} folder_data - Folder data
 */
export const create_folder = async (folder_data) => {
  try {
    const response = await api_client.post('/folders', folder_data)
    return response.data
  } catch (error) {
    console.error('Create folder error:', error)
    throw error
  }
}

/**
 * Update folder
 * @param {string} id - Folder ID
 * @param {Object} folder_data - Updated folder data
 */
export const update_folder = async (id, folder_data) => {
  try {
    const response = await api_client.put(`/folders/${id}`, folder_data)
    return response.data
  } catch (error) {
    console.error('Update folder error:', error)
    throw error
  }
}

/**
 * Delete folder
 * @param {string} id - Folder ID
 */
export const delete_folder = async (id) => {
  try {
    const response = await api_client.delete(`/folders/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete folder error:', error)
    throw error
  }
}
