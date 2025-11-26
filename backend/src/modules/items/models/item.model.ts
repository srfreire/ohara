import { z } from 'zod';
import { base_query_schema } from '../../../common/pagination/index';

export const item_schema = z.object({
  id: z.string().uuid(),
  document_id: z.string().uuid(),
  collection_id: z.string().uuid(),
  created_at: z.string(),
});

export const create_item_schema = z.object({
  document_id: z.string().uuid(),
});

export const query_items_schema = base_query_schema.extend({
  sort_by: z.enum(['created_at']).optional().default('created_at'),
});

export type Item = z.infer<typeof item_schema>;
export type CreateItemDto = z.infer<typeof create_item_schema>;
export type QueryItemsDto = z.infer<typeof query_items_schema>;
