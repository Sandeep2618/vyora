import { SubscriptionPlan } from '@/types';

export interface BillingPlanFeature {
  id: string;
  labelKey: string;
  defaultLabel: string;
  included: boolean;
}

export interface BillingPlanCardConfig {
  tier: SubscriptionPlan;
  titleKey: string;
  defaultTitle: string;
  priceText: string;
  descKey: string;
  defaultDesc: string;
  features: BillingPlanFeature[];
}
