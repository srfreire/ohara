import api_client from './client'
import type {
  ApiSuccessResponse,
  ApiListResponse,
  ApiDeleteResponse,
  Folder,
  FolderCreateInput,
  FolderUpdateInput,
  FolderListParams,
  PaginationMeta
} from '../types/api'

/**
 * Result type for paginated folder list
 */
export interface FolderListResult {
  folders: Folder[]
  pagination: PaginationMeta
}

/**
 * Get all folders with optional filters and cursor pagination
 * GET /v2/folders
 */
export const get_folders = async (params: FolderListParams = {}): Promise<FolderListResult> => {
  try {
    const response = await api_client.get<ApiListResponse<Folder>>('/folders', { params })
    return {
      folders: response.data.data,
      pagination: response.data.pagination
    }
  } catch (error) {
    console.error('Get folders error:', error)
    throw error
  }
}

/**
 * Get folder by ID
 * GET /v2/folders/:id
 */
export const get_folder_by_id = async (id: string): Promise<Folder> => {
  try {
    const response = await api_client.get<ApiSuccessResponse<Folder>>(`/folders/${id}`)
    return response.data.data
  } catch (error) {
    console.error('Get folder by ID error:', error)
    throw error
  }
}

/**
 * Create new folder
 * POST /v2/folders
 */
export const create_folder = async (folder_data: FolderCreateInput): Promise<Folder> => {
  try {
    const response = await api_client.post<ApiSuccessResponse<Folder>>('/folders', folder_data)
    return response.data.data
  } catch (error) {
    console.error('Create folder error:', error)
    throw error
  }
}

/**
 * Update folder
 * PUT /v2/folders/:id
 */
export const update_folder = async (id: string, folder_data: FolderUpdateInput): Promise<Folder> => {
  try {
    const response = await api_client.put<ApiSuccessResponse<Folder>>(`/folders/${id}`, folder_data)
    return response.data.data
  } catch (error) {
    console.error('Update folder error:', error)
    throw error
  }
}

/**
 * Delete folder
 * DELETE /v2/folders/:id
 */
export const delete_folder = async (id: string): Promise<string> => {
  try {
    const response = await api_client.delete<ApiDeleteResponse>(`/folders/${id}`)
    return response.data.message
  } catch (error) {
    console.error('Delete folder error:', error)
    throw error
  }
}
