import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// ============================================================================
// GLOBAL EXCEPTION FILTER
// ============================================================================
// Catches all exceptions thrown in the application and formats them into
// standardized error responses. Registered globally in app.module.ts.

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    // ========================================================================
    // EXTRACT REQUEST/RESPONSE CONTEXT
    // ========================================================================
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // ========================================================================
    // DETERMINE ERROR STATUS AND MESSAGE
    // ========================================================================
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response_body = exception.getResponse();
      message =
        typeof response_body === 'string'
          ? response_body
          : (response_body as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // ========================================================================
    // BUILD ERROR CONTEXT FOR LOGGING
    // ========================================================================
    const error_context = {
      method: request.method,
      path: request.url,
      status,
      message,
      user: (request as any).user?.email || 'unauthenticated',
    };

    // ========================================================================
    // LOG BASED ON ERROR SEVERITY
    // ========================================================================
    if (status >= 500) {
      this.logger.error(
        `${error_context.method} ${error_context.path} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${error_context.method} ${error_context.path} - ${status} ${message} - User: ${error_context.user}`,
      );
    }

    // ========================================================================
    // SEND STANDARDIZED ERROR RESPONSE
    // ========================================================================
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
