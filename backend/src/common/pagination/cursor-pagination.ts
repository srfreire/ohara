import { z } from 'zod';
import { CursorPaginationMeta } from '../dto/base-response.dto';

export interface CursorData {
  timestamp: string;
  id: string;
}

export interface CursorQueryConditions {
  timestamp_field: string;
  timestamp_value: string;
  id_value: string;
  ascending: boolean;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationMeta;
}

export const base_query_schema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type BaseQuery = z.infer<typeof base_query_schema>;

export function encode_cursor(data: CursorData): string {
  const cursor_string = `${data.timestamp}_${data.id}`;
  return Buffer.from(cursor_string).toString('base64');
}

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

export function apply_cursor_conditions(
  query_builder: any,
  conditions: CursorQueryConditions | null,
): any {
  if (!conditions) {
    return query_builder;
  }

  const { timestamp_field, timestamp_value, id_value, ascending } = conditions;

  if (ascending) {
    query_builder = query_builder.or(
      `${timestamp_field}.gt.${timestamp_value},and(${timestamp_field}.eq.${timestamp_value},id.gt.${id_value})`,
    );
  } else {
    query_builder = query_builder.or(
      `${timestamp_field}.lt.${timestamp_value},and(${timestamp_field}.eq.${timestamp_value},id.lt.${id_value})`,
    );
  }

  return query_builder;
}

export function build_cursor_response<T>(
  items: T[],
  limit: number,
  timestamp_field: string = 'created_at',
): CursorPaginatedResponse<T> {
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
