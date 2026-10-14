import { Request, Response, NextFunction } from 'express';
import { config } from '../../config';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip rate limiting in test environment
  if (config.env === 'test') {
    return next();
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = rateLimitStore.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetTime: now + config.rateLimitWindowMs,
    });
    return next();
  }

  record.count += 1;
  if (record.count > config.rateLimitMaxRequests) {
    return res.status(429).json({
      statusCode: 429,
      message: 'Too many requests, please slow down and try again later.',
      error: 'Too Many Requests',
    });
  }

  return next();
};
