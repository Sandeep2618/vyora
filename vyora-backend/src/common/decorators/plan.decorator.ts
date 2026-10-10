import { SetMetadata } from '@nestjs/common';

export const PLAN_KEY = 'subscription_plan';
export type SubscriptionTier = 'starter' | 'growth' | 'enterprise';

export const RequirePlan = (plan: SubscriptionTier) => SetMetadata(PLAN_KEY, plan);
