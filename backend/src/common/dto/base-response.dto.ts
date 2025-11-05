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
 * Generic paginated response wrapper for offset-based pagination
 */
export function create_paginated_response_schema<T extends z.ZodType>(item_schema: T) {
  return z.object({
    data: z.array(item_schema),
    pagination: pagination_meta_schema,
  });
}

/**
 * Generic paginated response wrapper for cursor-based pagination
 */
export function create_cursor_paginated_response_schema<T extends z.ZodType>(item_schema: T) {
  return z.object({
    data: z.array(item_schema),
    pagination: cursor_pagination_meta_schema,
  });
}

/**
 * Generic success response wrapper
 */
export const success_response_schema = z.object({
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type SuccessResponse = z.infer<typeof success_response_schema>;

/**
 * Generic error response
 */
export const error_response_schema = z.object({
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number().int(),
  timestamp: z.string().datetime(),
  path: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof error_response_schema>;

/**
 * Create success response helper
 */
export function create_success_response(message: string): SuccessResponse {
  return {
    message,
    timestamp: new Date().toISOString(),
  };
}
