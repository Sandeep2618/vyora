import { SubscriptionPlan } from '@/types';
import { BillingCycle } from '../enum';

export interface PlanPricingSelectorProps {
  selectedPlan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  pricing: {
    base: number;
    gst: number;
    total: number;
    monthlyEq: number;
  };
}
