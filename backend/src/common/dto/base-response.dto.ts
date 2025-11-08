import { z } from 'zod';

/**
 * Base pagination metadata for offset-based pagination
 */
export const pagination_meta_schema = z.object({
  limit: z.number().int().positive(),
  offset: z.number().int().min(0),
  has_more: z.boolean(),
  total: z.number().int().min(0).optional(),
});

export type PaginationMeta = z.infer<typeof pagination_meta_schema>;

/**
 * Base pagination metadata for cursor-based pagination
 */
export const cursor_pagination_meta_schema = z.object({
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
  limit: z.number().int().positive().optional(),
});

export type CursorPaginationMeta = z.infer<typeof cursor_pagination_meta_schema>;

/**
 * Create success response helper for DELETE operations
 */
export function create_success_response(message: string): { message: string; timestamp: string } {
  return {
    message,
    timestamp: new Date().toISOString(),
  };
}
