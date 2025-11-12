import { z } from 'zod';
import { CursorPaginationMeta } from '../dto/base-response.dto';

// ============================================================================
// CURSOR PAGINATION UTILITIES
// ============================================================================
// Keyset pagination using composite cursor: base64({timestamp}_{id})
// Services fetch limit+1, build_cursor_response() truncates and generates next_cursor

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

// Decoded cursor structure
export interface CursorData {
  timestamp: string; // ISO timestamp (created_at)
  id: string; // UUID for uniqueness
}

// Query conditions for Supabase filtering
export interface CursorQueryConditions {
  timestamp_field: string;
  timestamp_value: string;
  id_value: string;
  ascending: boolean;
}

// Service layer response (before HTTP transformation)
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationMeta;
}

// ============================================================================
// ZOD VALIDATION SCHEMA
// ============================================================================

export const cursor_query_schema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
});

export type CursorQuery = z.infer<typeof cursor_query_schema>;

// ============================================================================
// CURSOR ENCODING/DECODING
// ============================================================================

/**
 * Encode cursor to base64: {timestamp}_{id}
 */
export function encode_cursor(data: CursorData): string {
  const cursor_string = `${data.timestamp}_${data.id}`;
  return Buffer.from(cursor_string).toString('base64');
}

/**
 * Decode base64 cursor to CursorData
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

// ============================================================================
// CURSOR GENERATION
// ============================================================================

/**
 * Generate next cursor from last item in result set
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

// ============================================================================
// CURSOR QUERY PARSING
// ============================================================================

/**
 * Parse cursor and return filter conditions
 * Returns null for first page (no cursor)
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

// ============================================================================
// SUPABASE QUERY BUILDER INTEGRATION
// ============================================================================

/**
 * Apply cursor conditions to Supabase query builder
 * Implements keyset pagination using (timestamp, id) composite cursor
 */
export function apply_cursor_conditions(
  query_builder: any,
  conditions: CursorQueryConditions | null,
): any {
  // ========================================================================
  // NO CURSOR: RETURN UNMODIFIED QUERY (FIRST PAGE)
  // ========================================================================
  if (!conditions) {
    return query_builder;
  }

  const { timestamp_field, timestamp_value, id_value, ascending } = conditions;

  // ========================================================================
  // APPLY CURSOR FILTERING BASED ON SORT ORDER
  // ========================================================================
  if (ascending) {
    // Fetch items after cursor (forward in time)
    query_builder = query_builder.or(
      `${timestamp_field}.gt.${timestamp_value},and(${timestamp_field}.eq.${timestamp_value},id.gt.${id_value})`,
    );
  } else {
    // Fetch items before cursor (backward in time)
    query_builder = query_builder.or(
      `${timestamp_field}.lt.${timestamp_value},and(${timestamp_field}.eq.${timestamp_value},id.lt.${id_value})`,
    );
  }

  return query_builder;
}

// ============================================================================
// RESPONSE BUILDER
// ============================================================================

/**
 * Build paginated response from limit+1 items
 * Truncates to limit and generates cursor if more pages exist
 */
export function build_cursor_response<T>(
  items: T[],
  limit: number,
  timestamp_field: string = 'created_at',
): CursorPaginatedResponse<T> {
  // ========================================================================
  // DETECT IF MORE PAGES EXIST
  // ========================================================================
  // If we got more items than limit, there are more pages
  const has_more = items.length > limit;
  const data = has_more ? items.slice(0, limit) : items;

  // ========================================================================
  // GENERATE NEXT CURSOR FROM LAST ITEM
  // ========================================================================
  const next_cursor = has_more ? get_next_cursor(data, timestamp_field) : null;

  // ========================================================================
  // BUILD PAGINATED RESPONSE
  // ========================================================================
  return {
    data,
    pagination: {
      next_cursor,
      has_more,
      limit,
    },
  };
}
