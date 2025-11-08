import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

/**
 * Response structure that services can return
 */
export interface ServiceResponse<T = any> {
  data: T;
  pagination?: {
    next_cursor: string | null;
    has_more: boolean;
    limit: number;
  };
  message?: string;
}

/**
 * Standard API response format
 */
export interface StandardResponse<T = any> {
  success: true;
  data: T;
  pagination?: {
    next_cursor: string | null;
    has_more: boolean;
    limit: number;
  };
  message?: string;
}

/**
 * Metadata key to mark routes that should skip transformation
 */
export const SKIP_TRANSFORM_KEY = 'skipTransform';

/**
 * Decorator to skip response transformation (for SSE, file downloads, etc.)
 */
export const SkipTransform = () =>
  Reflect.metadata(SKIP_TRANSFORM_KEY, true);

/**
 * Global interceptor that wraps all responses in a standard format
 *
 * Transforms:
 * - Raw data → { success: true, data: ... }
 * - { data, pagination } → { success: true, data, pagination }
 * - { data, message } → { success: true, data: null, message }
 *
 * Skips transformation for:
 * - Routes decorated with @SkipTransform()
 * - Server-Sent Events (SSE)
 * - File downloads
 * - Responses already in standard format
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    // Check if this route should skip transformation
    const skip_transform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skip_transform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // If data is null or undefined, return success with null data
        if (data === null || data === undefined) {
          return {
            success: true,
            data: null,
          };
        }

        // If already in standard format, return as-is
        if (this.is_standard_response(data)) {
          return data;
        }

        // If service returned a structured response { data, pagination?, message? }
        if (this.is_service_response(data)) {
          const response: StandardResponse<T> = {
            success: true,
            data: data.data,
          };

          if (data.pagination) {
            response.pagination = data.pagination;
          }

          if (data.message) {
            response.message = data.message;
          }

          return response;
        }

        // Default: wrap raw data
        return {
          success: true,
          data,
        };
      }),
    );
  }

  /**
   * Check if response is already in standard format
   */
  private is_standard_response(data: any): data is StandardResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      'data' in data &&
      data.success === true
    );
  }

  /**
   * Check if response is a service response structure
   */
  private is_service_response(data: any): data is ServiceResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      !('success' in data)
    );
  }
}
