import api_client from './client'
import type {
  ApiSuccessResponse,
  ApiListResponse,
  ApiDeleteResponse,
  Reaction,
  ReactionCreateInput,
  ReactionUpdateInput,
  ReactionListParams,
  ReactionType,
  PaginationMeta
} from '../types/api'

/**
 * Result type for paginated reactions list
 */
export interface ReactionListResult {
  reactions: Reaction[]
  pagination: PaginationMeta
}

/**
 * Get reactions with optional filters and cursor pagination
 * GET /v2/reactions
 */
export const get_reactions = async (params: ReactionListParams = {}): Promise<ReactionListResult> => {
  try {
    const response = await api_client.get<ApiListResponse<Reaction>>('/reactions', { params })
    return {
      reactions: response.data.data,
      pagination: response.data.pagination
    }
  } catch (error) {
    console.error('Get reactions error:', error)
    throw error
  }
}

/**
 * Create a reaction
 * POST /v2/reactions
 */
export const create_reaction = async (reaction_data: ReactionCreateInput): Promise<Reaction> => {
  try {
    const response = await api_client.post<ApiSuccessResponse<Reaction>>('/reactions', reaction_data)
    return response.data.data
  } catch (error) {
    console.error('Create reaction error:', error)
    throw error
  }
}

/**
 * Update a reaction
 * PUT /v2/reactions/:id
 */
export const update_reaction = async (reaction_id: string, update_data: ReactionUpdateInput): Promise<Reaction> => {
  try {
    const response = await api_client.put<ApiSuccessResponse<Reaction>>(`/reactions/${reaction_id}`, update_data)
    return response.data.data
  } catch (error) {
    console.error('Update reaction error:', error)
    throw error
  }
}

/**
 * Delete a reaction
 * DELETE /v2/reactions/:id
 */
export const delete_reaction = async (reaction_id: string): Promise<string> => {
  try {
    const response = await api_client.delete<ApiDeleteResponse>(`/reactions/${reaction_id}`)
    return response.data.message
  } catch (error) {
    console.error('Delete reaction error:', error)
    throw error
  }
}

/**
 * Reaction type constants
 */
export const REACTION_TYPES: Record<string, ReactionType> = {
  LIKE: 'like',
  LOVE: 'love',
  INSIGHT: 'insight',
  QUESTION: 'question',
  FLAG: 'flag'
}

/**
 * Get emoji for reaction type
 */
export const get_reaction_emoji = (reaction_type: ReactionType): string => {
  const emoji_map: Record<ReactionType, string> = {
    like: '👍',
    love: '❤️',
    insight: '💡',
    question: '❓',
    flag: '🚩'
  }
  return emoji_map[reaction_type] || '👍'
}
