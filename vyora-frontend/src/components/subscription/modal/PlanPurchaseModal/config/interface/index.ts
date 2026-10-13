import { SubscriptionPlan } from '@/types';

export interface PlanPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan?: SubscriptionPlan;
  onSuccess?: (plan: SubscriptionPlan) => void;
}
