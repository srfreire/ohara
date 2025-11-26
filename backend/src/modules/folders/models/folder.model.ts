import { z } from 'zod';
import { base_query_schema } from '../../../common/pagination/index';

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

export const query_folders_schema = base_query_schema.extend({
  parent_id: z.string().uuid().optional(),
  sort_by: z.enum(['created_at', 'name']).optional().default('created_at'),
});

export type Folder = z.infer<typeof folder_schema>;
export type CreateFolderDto = z.infer<typeof create_folder_schema>;
export type UpdateFolderDto = z.infer<typeof update_folder_schema>;
export type QueryFoldersDto = z.infer<typeof query_folders_schema>;
