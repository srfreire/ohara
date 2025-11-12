import api_client from './client'
import type {
  ApiSuccessResponse,
  ApiListResponse,
  ApiDeleteResponse,
  Comment,
  CommentCreateInput,
  CommentUpdateInput,
  CommentListParams,
  PaginationMeta
} from '../types/api'

/**
 * Result type for paginated comments list
 */
export interface CommentListResult {
  comments: Comment[]
  pagination: PaginationMeta
}

/**
 * Get comments with optional filters and cursor pagination
 * GET /v2/comments
 */
export const get_comments = async (params: CommentListParams = {}): Promise<CommentListResult> => {
  try {
    const response = await api_client.get<ApiListResponse<Comment>>('/comments', { params })
    return {
      comments: response.data.data,
      pagination: response.data.pagination
    }
  } catch (error) {
    console.error('Get comments error:', error)
    throw error
  }
}

/**
 * Create a new comment
 * POST /v2/comments
 */
export const create_comment = async (comment_data: CommentCreateInput): Promise<Comment> => {
  try {
    const response = await api_client.post<ApiSuccessResponse<Comment>>('/comments', comment_data)
    return response.data.data
  } catch (error) {
    console.error('Create comment error:', error)
    throw error
  }
}

/**
 * Update a comment
 * PUT /v2/comments/:id
 */
export const update_comment = async (comment_id: string, update_data: CommentUpdateInput): Promise<Comment> => {
  try {
    const response = await api_client.put<ApiSuccessResponse<Comment>>(`/comments/${comment_id}`, update_data)
    return response.data.data
  } catch (error) {
    console.error('Update comment error:', error)
    throw error
  }
}

/**
 * Delete a comment
 * DELETE /v2/comments/:id
 */
export const delete_comment = async (comment_id: string): Promise<string> => {
  try {
    const response = await api_client.delete<ApiDeleteResponse>(`/comments/${comment_id}`)
    return response.data.message
  } catch (error) {
    console.error('Delete comment error:', error)
    throw error
  }
}
