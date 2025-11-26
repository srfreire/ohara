import { z } from 'zod';
import { base_query_schema } from '../../../common/pagination/index';

export const document_schema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  nessie_id: z.string().uuid(),
  folder_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const query_documents_schema = base_query_schema.extend({
  folder_id: z.string().uuid().optional(),
  search: z.string().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  sort_by: z.enum(['created_at', 'title', 'updated_at']).optional().default('created_at'),
});

export type Document = z.infer<typeof document_schema>;
export type QueryDocumentsDto = z.infer<typeof query_documents_schema>;
