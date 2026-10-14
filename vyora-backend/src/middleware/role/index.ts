import { Response, NextFunction } from 'express';
import { UserRole } from '@vyora/shared-types';
import { AuthenticatedRequest } from '../../common';
import { ForbiddenError } from '../../util';

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const effectiveRole = req.businessRole || req.user?.role;

    if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
      return next(
        new ForbiddenError(
          'Only business owners have permission to add, edit, or delete records. Staff accounts have view-only access.',
        ),
      );
    }

    return next();
  };
};
