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
  // Pagination (offset-based or cursor-based)
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  offset: z.coerce.number().min(0).optional().default(0),
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

// Response view schemas
export const document_list_view_schema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  folder_id: z.string().uuid(),
  created_at: z.string(),
});

export const document_detail_view_schema = document_schema;

export type Document = z.infer<typeof document_schema>;
export type QueryDocumentsDto = z.infer<typeof query_documents_schema>;
export type DocumentListView = z.infer<typeof document_list_view_schema>;
export type DocumentDetailView = z.infer<typeof document_detail_view_schema>;
