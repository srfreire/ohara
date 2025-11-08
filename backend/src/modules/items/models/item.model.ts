import { z } from 'zod';

export const item_schema = z.object({
  id: z.string().uuid(),
  document_id: z.string().uuid(),
  collection_id: z.string().uuid(),
  created_at: z.string(),
});

export const create_item_schema = z.object({
  document_id: z.string().uuid(),
});

// Query parameters for pagination
export const query_items_schema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  offset: z.coerce.number().min(0).optional().default(0),
  cursor: z.string().optional(),
  sort_by: z.enum(['created_at']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type Item = z.infer<typeof item_schema>;
export type CreateItemDto = z.infer<typeof create_item_schema>;
export type QueryItemsDto = z.infer<typeof query_items_schema>;
