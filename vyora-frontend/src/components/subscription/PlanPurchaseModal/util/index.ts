import { SubscriptionPlan } from '@/types';
import { BillingCycle } from '@/components/subscription/PlanPricingSelector';

export const calculatePlanPricing = (plan: SubscriptionPlan, cycle: BillingCycle) => {
  if (plan === 'enterprise') {
    const base = cycle === 'MONTHLY' ? 99900 : 959000;
    const gst = Math.round(base * 0.18);
    return { base, gst, total: base + gst, monthlyEq: cycle === 'ANNUAL' ? 79900 : 99900 };
  }
  const base = cycle === 'MONTHLY' ? 49900 : 479000;
  const gst = Math.round(base * 0.18);
  return { base, gst, total: base + gst, monthlyEq: cycle === 'ANNUAL' ? 39900 : 49900 };
};
