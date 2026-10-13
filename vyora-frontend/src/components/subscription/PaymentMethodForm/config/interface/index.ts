import { SubscriptionPlan } from '@/types';
import { PaymentMethodType } from '../enum';

export interface PaymentMethodFormProps {
  paymentMethod: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
  selectedPlan: SubscriptionPlan;
  totalMinor: number;
  upiId: string;
  onUpiIdChange: (val: string) => void;
  cardNumber: string;
  onCardNumberChange: (val: string) => void;
  cardExpiry: string;
  onCardExpiryChange: (val: string) => void;
  cardCvv: string;
  onCardCvvChange: (val: string) => void;
  selectedBank: string;
  onSelectedBankChange: (val: string) => void;
}
