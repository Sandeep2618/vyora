import { SubscriptionPlan } from '@/types';
import { BillingCycle } from '@/components/subscription/PlanPricingSelector';

export interface PlanCheckoutStatusProps {
  step: 'PROCESSING' | 'SUCCESS';
  totalMinor: number;
  selectedPlan: SubscriptionPlan;
  billingCycle: BillingCycle;
  businessName?: string;
  transactionId: string;
  onFinish: () => void;
}
