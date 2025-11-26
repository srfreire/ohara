import { z } from 'zod';
import { base_query_schema } from '../../../common/pagination/index';

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

export const query_users_schema = base_query_schema.extend({
  sort_by: z.enum(['created_at', 'email', 'name']).optional().default('created_at'),
});

export type User = z.infer<typeof user_schema>;
export type CreateUserDto = z.infer<typeof create_user_schema>;
export type UpdateUserDto = z.infer<typeof update_user_schema>;
export type QueryUsersDto = z.infer<typeof query_users_schema>;
