import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  PayloadTooLargeException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { UPLOAD_ERROR } from '../files/files.errors';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = 500;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      /* Строка или объект ValidationPipe */
      message = typeof res === 'object' ? (res as any).message || res : res;
    }

    if (exception instanceof EntityNotFoundError) {
      status = 404;
      message = 'Cущность не найдена';
    }

    if (exception instanceof NotFoundException) {
      status = 404;
      message = exception.message;
    }

    if (exception instanceof UnauthorizedException) {
      status = 401;
      message = exception.message;
    }

    if (exception instanceof ForbiddenException) {
      status = 403;
      message = exception.message;
    }

    if (exception instanceof PayloadTooLargeException) {
      status = 413;
      message = UPLOAD_ERROR.TOO_BIG;
    }

    if (
      exception instanceof QueryFailedError &&
      exception.driverError?.code === '23505'
    ) {
      const driverError = (exception as unknown as QueryFailedError)
        .driverError as {
        detail?: string;
        table?: string;
      };

      status = 409;
      message = `Запись уже существует в таблице ${driverError.table}`;
    }

    response.status(status).json({
      errorCode: status,
      message,
      status,
    });
  }
}
