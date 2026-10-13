import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@vyora/utils';
import { SubscriptionPlan } from '@/types';
import { PlanPricingSelector, BillingCycle } from '@/components/subscription/PlanPricingSelector';
import { PaymentMethodForm, PaymentMethodType } from '@/components/subscription/PaymentMethodForm';
import { PlanCheckoutStatus } from '@/components/subscription/PlanCheckoutStatus';
import { PlanPurchaseModalProps } from '../config/interface';
import { DEFAULT_TARGET_PLAN } from '../config/constant';
import { calculatePlanPricing } from '../util';

export const PlanPurchaseModal: React.FC<PlanPurchaseModalProps> = ({
  isOpen,
  onClose,
  targetPlan = DEFAULT_TARGET_PLAN,
  onSuccess,
}) => {
  const { business, updateSubscriptionPlan } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    targetPlan === 'starter' ? 'growth' : targetPlan,
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');

  // Payment form states
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Checkout flow state
  const [step, setStep] = useState<'CHECKOUT' | 'PROCESSING' | 'SUCCESS'>('CHECKOUT');
  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync if targetPlan prop changes when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(targetPlan === 'starter' ? 'growth' : targetPlan);
      setStep('CHECKOUT');
      setErrorMsg(null);
    }
  }, [isOpen, targetPlan]);

  const pricing = calculatePlanPricing(selectedPlan, billingCycle);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI Virtual Payment Address (e.g., yourname@okhdfcbank)');
      return;
    }
    if (paymentMethod === 'CARD' && cardNumber.replace(/\s+/g, '').length < 16) {
      setErrorMsg('Please provide a valid 16-digit debit or credit card number');
      return;
    }

    setStep('PROCESSING');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      await updateSubscriptionPlan(selectedPlan);

      const txn = `TXN-VYR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setTransactionId(txn);
      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment authorization failed. Please try again.');
      setStep('CHECKOUT');
    }
  };

  const handleFinish = () => {
    onSuccess?.(selectedPlan);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'PROCESSING' ? () => {} : onClose}
      title={
        step === 'SUCCESS'
          ? 'Subscription Activated!'
          : 'Upgrade Vyora Business Plan'
      }
      description={
        step === 'SUCCESS'
          ? 'Your payment was authorized and tier features are now active.'
          : 'Select your subscription tier, billing period, and authorized payment method.'
      }
      maxWidth="lg"
      footer={
        step === 'CHECKOUT' ? (
          <>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" form="plan-purchase-form" className="w-full sm:w-auto px-6">
              Pay {formatCurrency(pricing.total)} & Activate
            </Button>
          </>
        ) : undefined
      }
    >
      {step !== 'CHECKOUT' ? (
        <PlanCheckoutStatus
          step={step}
          totalMinor={pricing.total}
          selectedPlan={selectedPlan}
          billingCycle={billingCycle}
          businessName={business?.name}
          transactionId={transactionId}
          onFinish={handleFinish}
        />
      ) : (
        <form id="plan-purchase-form" onSubmit={handleCheckout} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900 rounded-xl text-xs text-[#B91C1C] dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <PlanPricingSelector
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            pricing={pricing}
          />

          <PaymentMethodForm
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            selectedPlan={selectedPlan}
            totalMinor={pricing.total}
            upiId={upiId}
            onUpiIdChange={setUpiId}
            cardNumber={cardNumber}
            onCardNumberChange={setCardNumber}
            cardExpiry={cardExpiry}
            onCardExpiryChange={setCardExpiry}
            cardCvv={cardCvv}
            onCardCvvChange={setCardCvv}
            selectedBank={selectedBank}
            onSelectedBankChange={setSelectedBank}
          />
        </form>
      )}
    </Modal>
  );
};
