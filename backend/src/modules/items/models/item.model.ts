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

export type Item = z.infer<typeof item_schema>;
export type CreateItemDto = z.infer<typeof create_item_schema>;
