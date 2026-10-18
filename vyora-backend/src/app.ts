import express, { Application } from 'express';
import cors from 'cors';
import { apiRouter } from './route';
import { healthRouter } from './modules/health';
import {
  requestIdMiddleware,
  requestLoggerMiddleware,
  errorHandler,
  notFoundHandler,
  rateLimiterMiddleware,
} from './middleware';

export function createApp(): Application {
  const app = express();

  // 1. Assign unique trace request ID to all incoming requests
  app.use(requestIdMiddleware);

  // 2. Permissive CORS matching production settings
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Accept',
        'Authorization',
        'x-business-id',
        'X-Business-Id',
        'x-request-id',
        'X-Request-Id',
        'idempotency-key',
        'Idempotency-Key',
        '*',
      ],
      exposedHeaders: ['X-Request-Id', 'Content-Disposition'],
    }),
  );

  // 3. HTTP Performance and Request Logging
  app.use(requestLoggerMiddleware);

  // 4. Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Global rate limiter
  app.use(rateLimiterMiddleware);

  // 6. Direct root health endpoint
  app.use('/health', healthRouter);

  // 7. Versioned API routes
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 8. 404 Handler
  app.use(notFoundHandler);

  // 9. Central Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
