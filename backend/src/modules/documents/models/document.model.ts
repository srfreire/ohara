import { z } from 'zod';

export const document_schema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  storage_path: z.string(),
  nessie_id: z.string(),
  folder_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const query_documents_schema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  offset: z.coerce.number().min(0).optional().default(0),
  folder_id: z.string().uuid().optional(),
});

export type Document = z.infer<typeof document_schema>;
export type QueryDocumentsDto = z.infer<typeof query_documents_schema>;
