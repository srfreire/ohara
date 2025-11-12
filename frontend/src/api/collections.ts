import api_client from './client'
import type {
  ApiSuccessResponse,
  ApiListResponse,
  ApiDeleteResponse,
  Collection,
  CollectionCreateInput,
  CollectionUpdateInput,
  CollectionListParams,
  CollectionItem,
  PaginationMeta
} from '../types/api'

/**
 * Result type for paginated collection list
 */
export interface CollectionListResult {
  collections: Collection[]
  pagination: PaginationMeta
}

/**
 * Result type for paginated collection items list
 */
export interface CollectionItemsResult {
  items: CollectionItem[]
  pagination: PaginationMeta
}

/**
 * Get all collections with cursor pagination
 * GET /v2/collections
 */
export const get_collections = async (params: CollectionListParams = {}): Promise<CollectionListResult> => {
  try {
    const response = await api_client.get<ApiListResponse<Collection>>('/collections', { params })
    return {
      collections: response.data.data,
      pagination: response.data.pagination
    }
  } catch (error) {
    console.error('Get collections error:', error)
    throw error
  }
}

/**
 * Get collection by ID
 * GET /v2/collections/:id
 */
export const get_collection_by_id = async (id: string): Promise<Collection> => {
  try {
    const response = await api_client.get<ApiSuccessResponse<Collection>>(`/collections/${id}`)
    return response.data.data
  } catch (error) {
    console.error('Get collection by ID error:', error)
    throw error
  }
}

/**
 * Create new collection
 * POST /v2/collections
 */
export const create_collection = async (collection_data: CollectionCreateInput): Promise<Collection> => {
  try {
    const response = await api_client.post<ApiSuccessResponse<Collection>>('/collections', collection_data)
    return response.data.data
  } catch (error) {
    console.error('Create collection error:', error)
    throw error
  }
}

/**
 * Update collection
 * PUT /v2/collections/:id
 */
export const update_collection = async (id: string, collection_data: CollectionUpdateInput): Promise<Collection> => {
  try {
    const response = await api_client.put<ApiSuccessResponse<Collection>>(`/collections/${id}`, collection_data)
    return response.data.data
  } catch (error) {
    console.error('Update collection error:', error)
    throw error
  }
}

/**
 * Delete collection
 * DELETE /v2/collections/:id
 */
export const delete_collection = async (id: string): Promise<string> => {
  try {
    const response = await api_client.delete<ApiDeleteResponse>(`/collections/${id}`)
    return response.data.message
  } catch (error) {
    console.error('Delete collection error:', error)
    throw error
  }
}

/**
 * Get items in a collection with cursor pagination
 * GET /v2/collections/:id/items
 */
export const get_collection_items = async (
  id: string,
  params: { limit?: number; cursor?: string; order?: 'asc' | 'desc' } = {}
): Promise<CollectionItemsResult> => {
  try {
    const response = await api_client.get<ApiListResponse<CollectionItem>>(`/collections/${id}/items`, { params })
    return {
      items: response.data.data,
      pagination: response.data.pagination
    }
  } catch (error) {
    console.error('Get collection items error:', error)
    throw error
  }
}

/**
 * Add item to collection
 * POST /v2/collections/:id/items
 */
export const add_item_to_collection = async (id: string, document_id: string): Promise<CollectionItem> => {
  try {
    console.log('=== ADD ITEM TO COLLECTION ===')
    console.log('Collection ID:', id)
    console.log('Document ID:', document_id)
    console.log('Payload being sent:', JSON.stringify({ document_id }))

    const response = await api_client.post<ApiSuccessResponse<CollectionItem>>(
      `/collections/${id}/items`,
      { document_id }
    )
    console.log('Add item response:', response.data)
    return response.data.data
  } catch (error) {
    console.error('❌ Add item to collection error:', error)
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any
      console.error('Full error object:', JSON.stringify(axiosError.response?.data, null, 2))
      console.error('Error response data:', axiosError.response?.data)
      console.error('Error status:', axiosError.response?.status)
      console.error('Request config:', axiosError.config)
    }
    throw error
  }
}

/**
 * Remove item from collection
 * DELETE /v2/collections/:id/items/:itemId
 */
export const remove_item_from_collection = async (collection_id: string, item_id: string): Promise<string> => {
  try {
    const response = await api_client.delete<ApiDeleteResponse>(`/collections/${collection_id}/items/${item_id}`)
    return response.data.message
  } catch (error) {
    console.error('Remove item from collection error:', error)
    throw error
  }
}
