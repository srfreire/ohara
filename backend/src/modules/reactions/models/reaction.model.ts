import { z } from 'zod';

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

export const query_reactions_schema = z.object({
  // Pagination (offset-based or cursor-based)
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  offset: z.coerce.number().min(0).optional().default(0),
  cursor: z.string().optional(), // Base64 encoded cursor for cursor-based pagination
  // Filters
  commentId: z.string().uuid().optional(),
  reaction_type: reaction_type_enum.optional(), // Filter by reaction type
  user_id: z.string().uuid().optional(), // Filter by user
  // Sorting
  sort_by: z.enum(['created_at', 'reaction_type']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// JSON Patch operation schema (RFC 6902)
export const reaction_patch_schema = z.object({
  op: z.enum(['replace']),
  path: z.enum(['/reaction_type']),
  value: reaction_type_enum,
});

export const reaction_patch_array_schema = z.array(reaction_patch_schema);

export type ReactionType = z.infer<typeof reaction_type_enum>;
export type Reaction = z.infer<typeof reaction_schema>;
export type CreateReactionDto = z.infer<typeof create_reaction_schema>;
export type UpdateReactionDto = z.infer<typeof update_reaction_schema>;
export type QueryReactionsDto = z.infer<typeof query_reactions_schema>;
export type ReactionPatch = z.infer<typeof reaction_patch_schema>;
export type ReactionPatchArray = z.infer<typeof reaction_patch_array_schema>;
