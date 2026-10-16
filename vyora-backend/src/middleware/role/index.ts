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
          `Access denied. This action requires ${allowedRoles.join(' or ')} permission, but your role is ${effectiveRole || 'STAFF'}.`,
          'ForbiddenRole',
          {
            requiredRoles: allowedRoles,
            currentRole: effectiveRole || 'STAFF',
          },
        ),
      );
    }

    return next();
  };
};
