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

export type User = z.infer<typeof user_schema>;
export type CreateUserDto = z.infer<typeof create_user_schema>;
export type UpdateUserDto = z.infer<typeof update_user_schema>;
