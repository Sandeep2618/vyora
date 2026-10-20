import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../../util';

interface ValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstErr = error.errors[0];
        const fieldPath = firstErr?.path?.length ? `${firstErr.path.join('.')}: ` : '';
        const firstMessage = `${fieldPath}${firstErr?.message || 'Validation error'}`;
        return next(new BadRequestError(firstMessage, error.errors));
      }
      return next(error);
    }
  };
};
