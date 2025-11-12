import { z } from 'zod';

// Standard cursor-based pagination metadata
export const cursor_pagination_meta_schema = z.object({
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
  limit: z.number().int().positive(),
});

export type CursorPaginationMeta = z.infer<typeof cursor_pagination_meta_schema>;

// Standard success response wrapper
export const success_response_schema = <T extends z.ZodTypeAny>(data_schema: T) =>
  z.object({
    success: z.literal(true),
    data: data_schema,
  });

// Standard paginated response wrapper with pagination
export const paginated_response_schema = <T extends z.ZodTypeAny>(data_schema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(data_schema),
    pagination: cursor_pagination_meta_schema,
  });

/**
 * Standard success response with message (for DELETE/UPDATE operations)
 */
export const message_response_schema = z.object({
  success: z.literal(true),
  data: z.null(),
  message: z.string(),
});

/**
 * Helper type for paginated responses
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: CursorPaginationMeta;
}

/**
 * Helper type for single resource responses
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Helper type for message responses
 */
export interface MessageResponse {
  success: true;
  data: null;
  message: string;
}

/**
 * Create success response for single resources
 */
export function create_success_response<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create paginated response
 */
export function create_paginated_response<T>(
  data: T[],
  pagination: CursorPaginationMeta,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
  };
}

/**
 * Create message response for DELETE/UPDATE operations
 */
export function create_message_response(message: string): MessageResponse {
  return {
    success: true,
    data: null,
    message,
  };
}
