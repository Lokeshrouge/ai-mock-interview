import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const userMessage = this.getUserMessage(exception);

    const errorResponse = {
      success: false,
      message: userMessage,
      error: {
        code: this.getErrorCode(exception),
        message: userMessage,
        details: this.getDetails(exception),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error for debugging
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response: any = exception.getResponse();
      return response.error || response.message || 'UNKNOWN_ERROR';
    }
    return 'INTERNAL_SERVER_ERROR';
  }

  private getUserMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response: any = exception.getResponse();
      if (typeof response === 'string') return response;
      if (response.message) {
        return Array.isArray(response.message)
          ? response.message[0]
          : response.message;
      }
    }
    return 'An unexpected error occurred';
  }

  private getDetails(exception: unknown): any[] {
    if (exception instanceof HttpException) {
      const response: any = exception.getResponse();
      if (response.message && Array.isArray(response.message)) {
        return response.message.map((msg: string) => ({ message: msg }));
      }
    }
    return [];
  }
}
