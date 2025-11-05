import { z } from 'zod';

export const user_schema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const create_user_schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const update_user_schema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  avatar_url: z.string().url().nullable().optional(),
});

// Response view schemas
export const user_list_view_schema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
});

export const user_detail_view_schema = user_schema;

// JSON Patch operation schema (RFC 6902)
export const user_patch_operation_schema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('replace'),
    path: z.enum(['/email', '/name', '/avatar_url']),
    value: z.union([z.string().email(), z.string(), z.string().url(), z.null()]),
  }),
]);

export const user_patch_array_schema = z.array(user_patch_operation_schema);

export type User = z.infer<typeof user_schema>;
export type CreateUserDto = z.infer<typeof create_user_schema>;
export type UpdateUserDto = z.infer<typeof update_user_schema>;
export type UserListView = z.infer<typeof user_list_view_schema>;
export type UserDetailView = z.infer<typeof user_detail_view_schema>;
export type UserPatchOperation = z.infer<typeof user_patch_operation_schema>;
export type UserPatchArray = z.infer<typeof user_patch_array_schema>;
