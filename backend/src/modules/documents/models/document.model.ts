import { z } from 'zod';

export const document_schema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  nessie_id: z.string().uuid(), // UNIQUE in DB
  folder_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const query_documents_schema = z.object({
  // Pagination (cursor-based)
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  cursor: z.string().optional(), // Base64 encoded cursor for cursor-based pagination
  // Filters
  folder_id: z.string().uuid().optional(),
  search: z.string().optional(), // Search by title
  created_after: z.string().datetime().optional(), // Filter by creation date
  created_before: z.string().datetime().optional(),
  // Sorting
  sort_by: z.enum(['created_at', 'title', 'updated_at']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type Document = z.infer<typeof document_schema>;
export type QueryDocumentsDto = z.infer<typeof query_documents_schema>;
