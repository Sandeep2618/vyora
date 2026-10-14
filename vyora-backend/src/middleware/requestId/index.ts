import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../../common';

export const requestIdMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const incomingId = req.headers['x-request-id'] as string | undefined;
  const requestId = incomingId && incomingId.length <= 64 ? incomingId : `req_${crypto.randomUUID()}`;

  req.id = requestId;
  req.startTime = performance.now();
  res.setHeader('X-Request-Id', requestId);

  next();
};
