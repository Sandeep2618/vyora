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

  try {
    let effectiveRole = req.user.role === 'ADMIN' ? 'ADMIN' : undefined;
    let permissions = req.user.role === 'ADMIN' ? ['*'] : [];
    let ownedBusiness: any = null;

    if (req.user.role !== 'ADMIN') {
      const membership = await MembershipModel.findOne({
        userId: req.user.id,
        businessId,
        isActive: true,
      });

      if (membership) {
        effectiveRole = membership.role;
        permissions = membership.permissions || [];
      } else {
        // Fallback: check if user is the direct owner of the business entity
        ownedBusiness = await BusinessModel.findOne({
          _id: businessId,
          ownerUserId: req.user.id,
        });

        if (ownedBusiness) {
          effectiveRole = 'OWNER';
          permissions = [
            'POS_CREATE_INVOICE',
            'INVENTORY_VIEW_STOCK',
            'INVENTORY_ADJUST_STOCK',
            'REPORTS_VIEW',
            'PURCHASES_MANAGE',
          ];
        } else {
          return next(
            new ForbiddenError('Forbidden: you do not have active membership in this business'),
          );
        }
      }
    }

    req.businessId = businessId;
    req.businessRole = effectiveRole as any;
    req.permissions = permissions;

    const biz =
      ownedBusiness ||
      (await BusinessModel.findById(businessId)
        .select('subscriptionPlan subscriptionStatus subscriptionExpiresAt')
        .lean());

    if (biz) {
      req.businessPlan = (biz as any).subscriptionPlan || 'growth';
      const isExpired =
        (biz as any).subscriptionStatus === 'expired' ||
        (Boolean((biz as any).subscriptionExpiresAt) &&
          new Date((biz as any).subscriptionExpiresAt) < new Date());
      req.isPlanExpired = !!isExpired;
    } else {
      req.businessPlan = 'starter';
      req.isPlanExpired = false;
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
