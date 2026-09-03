import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

export class TooManyAttemptsException extends HttpException {
  constructor(readonly retryAfter: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many attempts',
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/** The client needs the exact wait, so 429 carries a Retry-After header. */
@Catch(TooManyAttemptsException)
export class TooManyAttemptsFilter implements ExceptionFilter {
  catch(exception: TooManyAttemptsException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response
      .setHeader('Retry-After', String(exception.retryAfter))
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .json(exception.getResponse());
  }
}
