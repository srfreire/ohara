import { z } from 'zod';

export const folder_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  parent_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const create_folder_schema = z.object({
  name: z.string().min(1),
  parent_id: z.string().uuid().optional(),
});

export const update_folder_schema = z.object({
  name: z.string().min(1).optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

export const query_folders_schema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  cursor: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  sort_by: z.enum(['created_at', 'name']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type Folder = z.infer<typeof folder_schema>;
export type CreateFolderDto = z.infer<typeof create_folder_schema>;
export type UpdateFolderDto = z.infer<typeof update_folder_schema>;
export type QueryFoldersDto = z.infer<typeof query_folders_schema>;
