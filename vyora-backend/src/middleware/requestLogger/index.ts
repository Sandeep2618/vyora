import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common';
import { logger } from '../../util';

export const requestLoggerMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const start = performance.now();

  res.on('finish', () => {
    const durationMs = performance.now() - start;

    // Skip noisy polling requests like health checks from logs if desired, or log everything
    logger.http({
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs,
      requestId: req.id,
      tenantId: req.businessId,
      userId: req.user?.id,
      ip: req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    });
  });

  next();
};
