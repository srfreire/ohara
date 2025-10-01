import { z } from 'zod';

export const reaction_type_enum = z.enum([
  'like',
  'love',
  'insight',
  'question',
  'flag',
]);

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

export const query_reactions_schema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  offset: z.coerce.number().min(0).optional().default(0),
  commentId: z.string().uuid().optional(),
});

export type ReactionType = z.infer<typeof reaction_type_enum>;
export type Reaction = z.infer<typeof reaction_schema>;
export type CreateReactionDto = z.infer<typeof create_reaction_schema>;
export type UpdateReactionDto = z.infer<typeof update_reaction_schema>;
export type QueryReactionsDto = z.infer<typeof query_reactions_schema>;
