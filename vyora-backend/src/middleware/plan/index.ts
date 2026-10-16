import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common';
import { ForbiddenError } from '../../util';
import { SubscriptionTier } from '@vyora/shared-types';

const TIER_LEVELS: Record<string, number> = {
  starter: 1,
  free: 1,
  growth: 2,
  enterprise: 3,
};

export const requirePlan = (requiredPlan: SubscriptionTier) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const currentPlan: SubscriptionTier = (req.businessPlan as SubscriptionTier) || 'starter';
    const isPlanExpired = req.isPlanExpired || false;
    const effectiveRole = req.businessRole || req.user?.role || 'STAFF';
    const isOwner = effectiveRole === 'OWNER';

    if (isPlanExpired) {
      return next(
        new ForbiddenError(
          'Your subscription plan has expired. Please renew your plan to continue using Vyora features.',
          'PlanExpired',
          {
            plan: currentPlan,
            isOwner,
          },
        ),
      );
    }

    const currentLevel = TIER_LEVELS[currentPlan] || 1;
    const requiredLevel = TIER_LEVELS[requiredPlan] || 1;

    if (currentLevel < requiredLevel) {
      const planName = requiredPlan === 'enterprise' ? 'Business Pro' : 'Growth';
      return next(
        new ForbiddenError(
          `This feature requires the ${planName} plan. Please upgrade your subscription to access.`,
          'PlanLimitExceeded',
          {
            requiredPlan,
            currentPlan,
            isOwner,
          },
        ),
      );
    }

    return next();
  };
};
