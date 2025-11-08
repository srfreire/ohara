import { z } from 'zod';

/**
 * Cursor pagination utilities for efficient pagination of large datasets
 * Uses base64-encoded cursor format: {timestamp}_{id}
 */

export interface CursorData {
  timestamp: string; // ISO timestamp (created_at)
  id: string; // UUID for uniqueness
}

/**
 * Encode cursor data to base64 string
 */
export function encode_cursor(data: CursorData): string {
  const cursor_string = `${data.timestamp}_${data.id}`;
  return Buffer.from(cursor_string).toString('base64');
}

/**
 * Decode base64 cursor string to cursor data
 */
export function decode_cursor(cursor: string): CursorData {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [timestamp, id] = decoded.split('_');

    if (!timestamp || !id) {
      throw new Error('Invalid cursor format');
    }

    return { timestamp, id };
  } catch (error) {
    throw new Error('Invalid cursor');
  }
}

/**
 * Get next cursor from the last item in the result set
 */
export function get_next_cursor(
  items: any[],
  timestamp_field: string = 'created_at',
): string | null {
  if (items.length === 0) {
    return null;
  }

  const last_item = items[items.length - 1];
  const timestamp = last_item[timestamp_field];
  const id = last_item.id;

  if (!timestamp || !id) {
    return null;
  }

  return encode_cursor({ timestamp, id });
}

/**
 * Zod schema for cursor-based pagination query parameters
 */
export const cursor_query_schema = z.object({
  cursor: z.string().optional(), // Base64 encoded cursor
  limit: z.coerce.number().min(1).max(100).optional().default(25),
});

export type CursorQuery = z.infer<typeof cursor_query_schema>;

/**
 * Build cursor-based query conditions for Supabase
 * For descending order (newest first): WHERE (created_at, id) < (cursor_timestamp, cursor_id)
 * For ascending order (oldest first): WHERE (created_at, id) > (cursor_timestamp, cursor_id)
 */
export interface CursorQueryConditions {
  timestamp_field: string;
  timestamp_value: string;
  id_value: string;
  ascending: boolean;
}

/**
 * Parse cursor query parameters and return conditions
 */
export function parse_cursor_query(
  cursor: string | undefined,
  timestamp_field: string = 'created_at',
  ascending: boolean = false,
): CursorQueryConditions | null {
  if (!cursor) {
    return null;
  }

  const cursor_data = decode_cursor(cursor);

  return {
    timestamp_field,
    timestamp_value: cursor_data.timestamp,
    id_value: cursor_data.id,
    ascending,
  };
}

/**
 * Apply cursor conditions to a Supabase query builder
 * This implements keyset pagination using (timestamp, id) composite cursor
 */
export function apply_cursor_conditions(
  query_builder: any,
  conditions: CursorQueryConditions | null,
): any {
  if (!conditions) {
    return query_builder;
  }

  const { timestamp_field, timestamp_value, id_value, ascending } = conditions;

  if (ascending) {
    // For ascending order: get items after cursor
    // WHERE (timestamp > cursor_timestamp) OR (timestamp = cursor_timestamp AND id > cursor_id)
    query_builder = query_builder.or(
      `${timestamp_field}.gt.${timestamp_value},and(${timestamp_field}.eq.${timestamp_value},id.gt.${id_value})`,
    );
  } else {
    // For descending order: get items before cursor
    // WHERE (timestamp < cursor_timestamp) OR (timestamp = cursor_timestamp AND id < cursor_id)
    query_builder = query_builder.or(
      `${timestamp_field}.lt.${timestamp_value},and(${timestamp_field}.eq.${timestamp_value},id.lt.${id_value})`,
    );
  }

  return query_builder;
}

/**
 * Create a paginated response with cursor metadata
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    next_cursor: string | null;
    has_more: boolean;
    limit: number;
  };
}

/**
 * Build cursor paginated response
 */
export function build_cursor_response<T>(
  items: T[],
  limit: number,
  timestamp_field: string = 'created_at',
): CursorPaginatedResponse<T> {
  // Check if there are more items by fetching limit + 1 and trimming
  const has_more = items.length > limit;
  const data = has_more ? items.slice(0, limit) : items;
  const next_cursor = has_more ? get_next_cursor(data, timestamp_field) : null;

  return {
    data,
    pagination: {
      next_cursor,
      has_more,
      limit,
    },
  };
}
