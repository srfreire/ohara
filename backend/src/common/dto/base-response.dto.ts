import { z } from 'zod';

// ============================================================================
// ZOD SCHEMAS (Runtime Validation)
// ============================================================================

export const cursor_pagination_meta_schema = z.object({
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
  limit: z.number().int().positive(),
});

export const success_response_schema = <T extends z.ZodTypeAny>(data_schema: T) =>
  z.object({
    success: z.literal(true),
    data: data_schema,
  });

export const paginated_response_schema = <T extends z.ZodTypeAny>(data_schema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(data_schema),
    pagination: cursor_pagination_meta_schema,
  });

export const message_response_schema = z.object({
  success: z.literal(true),
  data: z.null(),
  message: z.string(),
});

// ============================================================================
// TYPESCRIPT TYPES (For response schemas)
// ============================================================================

export type CursorPaginationMeta = z.infer<typeof cursor_pagination_meta_schema>;

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: CursorPaginationMeta;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface MessageResponse {
  success: true;
  data: null;
  message: string;
}

// ============================================================================
// HELPER FUNCTIONS (Response Builders)
// ============================================================================

export function create_success_response<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

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

export function create_message_response(message: string): MessageResponse {
  return {
    success: true,
    data: null,
    message,
  };
}
