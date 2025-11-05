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

// Response view schemas
export const collection_list_view_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  visibility: visibility_enum,
  created_at: z.string(),
});

export const collection_detail_view_schema = collection_schema;

// JSON Patch operation schema (RFC 6902)
export const collection_patch_operation_schema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('replace'),
    path: z.enum(['/name', '/description', '/visibility']),
    value: z.union([z.string(), visibility_enum]),
  }),
]);

export const collection_patch_array_schema = z.array(collection_patch_operation_schema);

export type Visibility = z.infer<typeof visibility_enum>;
export type Collection = z.infer<typeof collection_schema>;
export type CreateCollectionDto = z.infer<typeof create_collection_schema>;
export type UpdateCollectionDto = z.infer<typeof update_collection_schema>;
export type CollectionListView = z.infer<typeof collection_list_view_schema>;
export type CollectionDetailView = z.infer<typeof collection_detail_view_schema>;
export type CollectionPatchOperation = z.infer<typeof collection_patch_operation_schema>;
export type CollectionPatchArray = z.infer<typeof collection_patch_array_schema>;
