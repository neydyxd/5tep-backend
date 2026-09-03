import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ValidationError } from 'class-validator';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TooManyAttemptsFilter } from './auth/too-many-attempts';

function validationFailure(
  errors: ValidationError[],
): UnprocessableEntityException {
  // Only field names and rule names are returned: the value itself (a password included)
  // is never logged and never echoed back.
  return new UnprocessableEntityException({
    statusCode: 422,
    message: 'Validation failed',
    fields: errors.map((error) => ({
      field: error.property,
      rules: Object.keys(error.constraints ?? {}),
    })),
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet());
  // Login throttling counts the client address rather than the proxy address.
  app.set('trust proxy', 1);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationFailure,
    }),
  );
  app.useGlobalFilters(new TooManyAttemptsFilter());
  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
