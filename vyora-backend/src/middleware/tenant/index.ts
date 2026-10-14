import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common';
import { UnauthorizedError, ForbiddenError } from '../../util';
import { MembershipModel, BusinessModel } from '../../modules/business/model';

export const tenantMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new UnauthorizedError('User authentication required before tenant verification'));
  }

  const rawBusinessId =
    (req.headers['x-business-id'] as string) || req.user.businessId;

  if (!rawBusinessId || rawBusinessId === 'undefined' || rawBusinessId === 'null') {
    return next(
      new UnauthorizedError('Missing business context (x-business-id header required)'),
    );
  }

  const businessId = rawBusinessId.trim();

  if (req.user.role === 'ADMIN') {
    req.businessId = businessId;
    req.businessRole = 'ADMIN';
    return next();
  }

  try {
    const membership = await MembershipModel.findOne({
      userId: req.user.id,
      businessId,
      isActive: true,
    });

    if (membership) {
      req.businessId = businessId;
      req.businessRole = membership.role;
      req.permissions = membership.permissions || [];
      return next();
    }

    // Fallback: check if user is the direct owner of the business entity
    const ownedBusiness = await BusinessModel.findOne({
      _id: businessId,
      ownerUserId: req.user.id,
    });

    if (ownedBusiness) {
      req.businessId = businessId;
      req.businessRole = 'OWNER';
      req.permissions = [
        'POS_CREATE_INVOICE',
        'INVENTORY_VIEW_STOCK',
        'INVENTORY_ADJUST_STOCK',
        'REPORTS_VIEW',
        'PURCHASES_MANAGE',
      ];
      return next();
    }

    return next(
      new ForbiddenError('Forbidden: you do not have active membership in this business'),
    );
  } catch (err) {
    return next(err);
  }
};
