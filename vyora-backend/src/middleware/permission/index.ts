import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common';
import { ForbiddenError } from '../../util';

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.businessRole || req.user?.role;

    // Owners and Admins have unrestricted permissions
    if (role === 'OWNER' || role === 'ADMIN') {
      return next();
    }

    if (req.permissions && req.permissions.includes(permission)) {
      return next();
    }

    return next(
      new ForbiddenError(`Forbidden: missing required permission [${permission}]`),
    );
  };
};
