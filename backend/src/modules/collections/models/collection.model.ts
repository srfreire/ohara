import { z } from 'zod';

export const visibility_enum = z.enum(['private', 'unlisted', 'public']);

export const collection_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  user_id: z.string().uuid(),
  description: z.string().nullable(),
  visibility: visibility_enum,
  created_at: z.string(),
  updated_at: z.string(),
});

export const create_collection_schema = z.object({
  name: z.string().min(1),
  user_id: z.string().uuid(),
  description: z.string().optional(),
  visibility: visibility_enum.optional().default('private'),
});

export const update_collection_schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  visibility: visibility_enum.optional(),
});

export type Visibility = z.infer<typeof visibility_enum>;
export type Collection = z.infer<typeof collection_schema>;
export type CreateCollectionDto = z.infer<typeof create_collection_schema>;
export type UpdateCollectionDto = z.infer<typeof update_collection_schema>;
