import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * High-performance sliding-window in-memory Rate Limiting Middleware.
 * Protects backend from DDoS, brute-force attacks, and runaway client polling (1,000 - 50,000 users).
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitRecord>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Evict expired records every 60s to prevent memory accumulation at scale
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetTime) {
          this.store.delete(key);
        }
      }
    }, 60000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const isAuthRoute =
      req.originalUrl.includes('/auth/login') || req.originalUrl.includes('/auth/register');

    // Strict 25 req/min for auth routes to prevent credential stuffing; 200 req/min for general API
    const limit = isAuthRoute ? 25 : 200;
    const windowMs = 60 * 1000;
    const now = Date.now();

    const key = `${ip}:${isAuthRoute ? 'auth' : 'api'}`;
    let record = this.store.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      this.store.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, limit - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    // Apply security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    if (record.count > limit) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait a moment and try again.',
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  }
}
