import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { HttpErrorFilter } from './common/filters/http-error.filter';

export function setupApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const origin =
    config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:5173';
  app.enableShutdownHooks();

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers.origin &&
      req.headers.origin !== origin
    ) {
      res
        .status(403)
        .json({ code: 'FORBIDDEN', message: 'Request origin is not allowed' });
      return;
    }
    next();
  });
  app.enableCors({
    origin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpErrorFilter());
}
