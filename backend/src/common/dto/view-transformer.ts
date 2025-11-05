import { z } from 'zod';

/**
 * View types for different response contexts
 */
export enum ViewType {
  LIST = 'list', // Minimal fields for list views
  DETAIL = 'detail', // Full fields for detail views
  MINIMAL = 'minimal', // Absolute minimum (id, name)
}

/**
 * Base view transformer interface
 */
export interface ViewTransformer<TEntity, TListView, TDetailView> {
  to_list_view(entity: TEntity): TListView;
  to_detail_view(entity: TEntity): TDetailView;
}

/**
 * Helper to pick specific fields from an object
 */
export function pick_fields<T extends object, K extends keyof T>(obj: T, fields: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const field of fields) {
    if (field in obj) {
      result[field] = obj[field];
    }
  }
  return result;
}

/**
 * Helper to omit specific fields from an object
 */
export function omit_fields<T extends object, K extends keyof T>(obj: T, fields: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const field of fields) {
    delete result[field];
  }
  return result;
}

/**
 * Create a view schema by picking specific fields from a base schema
 * Note: This is a runtime helper, Zod schemas need to be defined separately
 */
export function create_view_schema<T extends z.ZodObject<any>>(
  base_schema: T,
  fields: (keyof T['shape'])[],
): z.ZodObject<any> {
  const shape: any = {};
  for (const field of fields) {
    if (field in base_schema.shape) {
      shape[field] = base_schema.shape[field];
    }
  }
  return z.object(shape);
}
