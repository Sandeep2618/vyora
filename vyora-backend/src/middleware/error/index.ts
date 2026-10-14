import { Request, Response, NextFunction } from 'express';
import { AppError, logger } from '../../util';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.id;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`AppError [${err.statusCode}] on ${req.method} ${req.originalUrl} [ReqID: ${requestId}]`, {
        message: err.message,
        errorCode: err.errorCode,
        details: err.details,
        tenantId: req.businessId,
        userId: req.user?.id,
      });
    } else {
      logger.warn(`AppError [${err.statusCode}] ${err.errorCode}: ${err.message} [ReqID: ${requestId}]`, {
        details: err.details,
      });
    }

    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.errorCode,
      details: err.details,
      requestId,
    });
  }

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'record';
    logger.warn(`Conflict: Duplicate key on ${field} [ReqID: ${requestId}]`, err.keyValue);
    return res.status(409).json({
      statusCode: 409,
      message: `A record with this ${field} already exists`,
      error: 'Conflict',
      requestId,
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    logger.warn(`CastError on path ${err.path} with value ${err.value} [ReqID: ${requestId}]`);
    return res.status(400).json({
      statusCode: 400,
      message: `Invalid identifier format: ${err.value}`,
      error: 'Bad Request',
      requestId,
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const firstMsg = Object.values(err.errors || {})[0] as any;
    logger.warn(`Mongoose ValidationError on ${req.method} ${req.originalUrl} [ReqID: ${requestId}]`, {
      errors: err.errors,
    });
    return res.status(400).json({
      statusCode: 400,
      message: firstMsg?.message || 'Validation failed',
      error: 'Bad Request',
      requestId,
    });
  }

  // Unhandled internal server error
  logger.error(`🔥 [Unhandled Server Error] on ${req.method} ${req.originalUrl} [ReqID: ${requestId}]: ${err.message}`, {
    stack: err.stack,
    tenantId: req.businessId,
    userId: req.user?.id,
    query: req.query,
    body: req.body,
  });

  return res.status(500).json({
    statusCode: 500,
    message: 'Internal server error',
    error: 'Internal Server Error',
    requestId,
  });
};
