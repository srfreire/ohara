import api_client from './client'
import type {
  ApiSuccessResponse,
  ApiListResponse,
  ApiDeleteResponse,
  Document,
  DocumentCreateInput,
  DocumentUpdateInput,
  DocumentListParams,
  DocumentUrlResponse,
  PaginationMeta
} from '../types/api'

/**
 * Result type for paginated document list
 */
export interface DocumentListResult {
  documents: Document[]
  pagination: PaginationMeta
}

/**
 * Get all documents with optional filters and cursor pagination
 * GET /v2/documents
 */
export const get_documents = async (params: DocumentListParams = {}): Promise<DocumentListResult> => {
  try {
    const response = await api_client.get<ApiListResponse<Document>>('/documents', { params })
    return {
      documents: response.data.data,
      pagination: response.data.pagination
    }
  } catch (error) {
    console.error('Get documents error:', error)
    throw error
  }
}

/**
 * Get document by ID
 * GET /v2/documents/:id
 */
export const get_document_by_id = async (id: string): Promise<Document> => {
  try {
    const response = await api_client.get<ApiSuccessResponse<Document>>(`/documents/${id}`)
    return response.data.data
  } catch (error) {
    console.error('Get document by ID error:', error)
    throw error
  }
}

/**
 * Get signed URL for document PDF
 * GET /v2/documents/:id/url
 */
export const get_document_url = async (id: string): Promise<DocumentUrlResponse> => {
  try {
    const response = await api_client.get<ApiSuccessResponse<DocumentUrlResponse>>(`/documents/${id}/url`)
    return response.data.data
  } catch (error) {
    console.error('Get document URL error:', error)
    throw error
  }
}

/**
 * Create new document
 * POST /v2/documents
 */
export const create_document = async (document_data: DocumentCreateInput): Promise<Document> => {
  try {
    const response = await api_client.post<ApiSuccessResponse<Document>>('/documents', document_data)
    return response.data.data
  } catch (error) {
    console.error('Create document error:', error)
    throw error
  }
}

/**
 * Update document
 * PUT /v2/documents/:id
 */
export const update_document = async (id: string, document_data: DocumentUpdateInput): Promise<Document> => {
  try {
    const response = await api_client.put<ApiSuccessResponse<Document>>(`/documents/${id}`, document_data)
    return response.data.data
  } catch (error) {
    console.error('Update document error:', error)
    throw error
  }
}

/**
 * Delete document
 * DELETE /v2/documents/:id
 */
export const delete_document = async (id: string): Promise<string> => {
  try {
    const response = await api_client.delete<ApiDeleteResponse>(`/documents/${id}`)
    return response.data.message
  } catch (error) {
    console.error('Delete document error:', error)
    throw error
  }
}
