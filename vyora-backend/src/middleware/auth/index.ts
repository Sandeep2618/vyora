import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UnauthorizedError } from '../../util';
import { AuthenticatedRequest } from '../../common';
import { UserModel } from '../../modules/auth/model';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token is required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;

    // Verify that the user still exists in the database
    const userExists = await UserModel.exists({ _id: payload.sub });
    if (!userExists) {
      return next(new UnauthorizedError('User account not found or deleted. Please sign in again.'));
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      phone: payload.phone,
      name: payload.name || '',
      role: payload.role || 'STAFF',
      businessId: payload.businessId,
    };
    return next();
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};
