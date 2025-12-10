import { z } from 'zod';
import { base_query_schema } from '../../../common/pagination/index';

export const reaction_type_enum = z.enum(['like', 'love', 'insight', 'question', 'flag']);

export const reaction_schema = z.object({
  id: z.string().uuid(),
  comment_id: z.string().uuid(),
  user_id: z.string().uuid(),
  reaction_type: reaction_type_enum,
  created_at: z.string(),
});

export const create_reaction_schema = z.object({
  comment_id: z.string().uuid(),
  user_id: z.string().uuid(),
  reaction_type: reaction_type_enum,
});

export const update_reaction_schema = z.object({
  reaction_type: reaction_type_enum,
});

export const query_reactions_schema = base_query_schema.extend({
  comment_id: z.string().uuid().optional(),
  reaction_type: reaction_type_enum.optional(),
  user_id: z.string().uuid().optional(),
  sort_by: z.enum(['created_at', 'reaction_type']).optional().default('created_at'),
});

export type ReactionType = z.infer<typeof reaction_type_enum>;
export type Reaction = z.infer<typeof reaction_schema>;
export type CreateReactionDto = z.infer<typeof create_reaction_schema>;
export type UpdateReactionDto = z.infer<typeof update_reaction_schema>;
export type QueryReactionsDto = z.infer<typeof query_reactions_schema>;
