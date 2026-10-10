import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLAN_KEY, SubscriptionTier } from '../decorators/plan.decorator';

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  starter: 1,
  growth: 2,
  enterprise: 3,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.getAllAndOverride<SubscriptionTier>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlan) {
      return true;
    }

    const { businessPlan } = context.switchToHttp().getRequest();
    const currentPlan: SubscriptionTier = businessPlan || 'starter';

    const currentLevel = TIER_LEVELS[currentPlan] || 1;
    const requiredLevel = TIER_LEVELS[requiredPlan] || 1;

    if (currentLevel < requiredLevel) {
      const planName = requiredPlan === 'enterprise' ? 'Business Pro' : 'Growth';
      throw new ForbiddenException(
        `This feature requires the ${planName} plan. Please upgrade your subscription to access.`,
      );
    }

    return true;
  }
}
