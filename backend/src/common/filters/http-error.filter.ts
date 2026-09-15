import { Prisma } from '@prisma/client';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'object' && payload !== null) {
        const body = payload as Record<string, unknown>;
        const message = Array.isArray(body.message)
          ? String(body.message[0])
          : (body.message as string) || exception.message;
        response.status(status).json({
          code: (body.code as string) || this.codeFromStatus(status),
          message,
        });
        return;
      }
      response.status(status).json({
        code: this.codeFromStatus(status),
        message: String(payload),
      });
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const errors: Record<
        string,
        { status: number; code: string; message: string }
      > = {
        P2002: {
          status: 409,
          code: 'CONFLICT',
          message: 'A record with these unique fields already exists',
        },
        P2025: { status: 404, code: 'NOT_FOUND', message: 'Record not found' },
        P2003: {
          status: 409,
          code: 'CONFLICT',
          message: 'A related record is missing or still in use',
        },
      };
      const error = errors[exception.code];
      if (error) {
        response
          .status(error.status)
          .json({ code: error.code, message: error.message });
        return;
      }
    }
    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    });
  }

  private codeFromStatus(status: number): string {
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 429:
        return 'RATE_LIMITED';
      default:
        return 'ERROR';
    }
  }
}
