import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import {
  SuccessResponse,
  PaginatedResponse,
  MessageResponse,
  CursorPaginationMeta,
} from '../dto/base-response.dto';

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

// Union type for all possible standard response formats
export type StandardResponse<T = any> = SuccessResponse<T> | PaginatedResponse<T> | MessageResponse;

// Internal type for service responses before transformation
interface ServiceResponse<T = any> {
  data: T;
  pagination?: CursorPaginationMeta;
  message?: string;
}

// ============================================================================
// DECORATOR & METADATA KEY
// ============================================================================

export const SKIP_TRANSFORM_KEY = 'skipTransform';

export const SkipTransform = () => Reflect.metadata(SKIP_TRANSFORM_KEY, true);

// ============================================================================
// GLOBAL RESPONSE TRANSFORM INTERCEPTOR
// ============================================================================
// Automatically wraps all controller responses in a standardized format:
// { success: true, data: ..., pagination?: ..., message?: ... }
//
// Registered globally in main.ts with app.useGlobalInterceptors()

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    // ========================================================================
    // CHECK IF TRANSFORMATION SHOULD BE SKIPPED
    // ========================================================================
    // Routes decorated with @SkipTransform() bypass this interceptor
    const skip_transform = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip_transform) {
      return next.handle();
    }

    // ========================================================================
    // TRANSFORM RESPONSE BASED ON DATA TYPE
    // ========================================================================
    return next.handle().pipe(
      map((data) => {
        // Case 1: Null or undefined data
        if (data === null || data === undefined) {
          return {
            success: true,
            data: null,
          };
        }

        // Case 2: Already in standard format
        if (this.is_standard_response(data)) {
          return data;
        }

        // Case 3: Service response with structured data
        if (this.is_service_response(data)) {
          // Has pagination: return PaginatedResponse
          if (data.pagination) {
            return {
              success: true,
              data: data.data,
              pagination: data.pagination,
            } as PaginatedResponse<any>;
          }

          // Has message: return MessageResponse
          if (data.message) {
            return {
              success: true,
              data: data.data,
              message: data.message,
            } as MessageResponse;
          }

          // Just data: return SuccessResponse
          return {
            success: true,
            data: data.data,
          } as SuccessResponse<any>;
        }

        // Case 4: Raw data (default)
        return {
          success: true,
          data,
        } as SuccessResponse<T>;
      }),
    );
  }

  // ==========================================================================
  // HELPER METHODS (Type Guards)
  // ==========================================================================

  private is_standard_response(data: any): data is StandardResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      'data' in data &&
      data.success === true
    );
  }

  private is_service_response(data: any): data is ServiceResponse {
    return typeof data === 'object' && data !== null && 'data' in data && !('success' in data);
  }
}
