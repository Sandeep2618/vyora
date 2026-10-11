import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building2,
  QrCode,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { formatCurrency } from '@vyora/utils';
import { SubscriptionPlan } from '../../types';

interface PlanPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan?: SubscriptionPlan;
  onSuccess?: (plan: SubscriptionPlan) => void;
}

type BillingCycle = 'MONTHLY' | 'ANNUAL';
type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING';

export const PlanPurchaseModal: React.FC<PlanPurchaseModalProps> = ({
  isOpen,
  onClose,
  targetPlan = 'growth',
  onSuccess,
}) => {
  const { business, updateSubscriptionPlan } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    targetPlan === 'starter' ? 'growth' : targetPlan,
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Payment form states
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(business?.name || '');

  // Checkout flow state
  const [step, setStep] = useState<'CHECKOUT' | 'PROCESSING' | 'SUCCESS'>('CHECKOUT');
  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync if targetPlan prop changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPlan(targetPlan === 'starter' ? 'growth' : targetPlan);
      setStep('CHECKOUT');
      setErrorMsg(null);
    }
  }, [isOpen, targetPlan]);

  // Minor unit pricing (paisa)
  const getPricing = (plan: SubscriptionPlan, cycle: BillingCycle) => {
    if (plan === 'enterprise') {
      // Pro: ₹999/mo (99,900 paisa) or ₹9,590/yr (959,000 paisa)
      const base = cycle === 'MONTHLY' ? 99900 : 959000;
      const gst = Math.round(base * 0.18);
      return { base, gst, total: base + gst, monthlyEq: cycle === 'ANNUAL' ? 79900 : 99900 };
    }
    // Growth: ₹499/mo (49,900 paisa) or ₹4,790/yr (479,000 paisa)
    const base = cycle === 'MONTHLY' ? 49900 : 479000;
    const gst = Math.round(base * 0.18);
    return { base, gst, total: base + gst, monthlyEq: cycle === 'ANNUAL' ? 39900 : 49900 };
  };

  const pricing = getPricing(selectedPlan, billingCycle);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
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
      // Simulate bank gateway authorization delay (1.4 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Call API to activate plan
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
      {step === 'PROCESSING' ? (
        <div className="py-14 text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 border-4 border-[#A0D2CA] border-t-[#0F766E] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#0F766E]" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#123B3A]">
              Connecting to Indian Banking Gateway...
            </h3>
            <p className="text-xs text-[#566B69]">
              Authorizing {formatCurrency(pricing.total)} via 256-bit encrypted checkout. Please do not refresh.
            </p>
          </div>
        </div>
      ) : step === 'SUCCESS' ? (
        <div className="py-6 space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-[#123B3A]">
              Payment Successful & Plan Activated!
            </h3>
            <p className="text-xs sm:text-sm text-[#566B69] max-w-md mx-auto">
              Your business is now upgraded to the{' '}
              <strong className="text-[#0F766E]">
                {selectedPlan === 'enterprise' ? 'Business Pro' : 'Growth Plan'}
              </strong>
              . All features, team role assignments, and reports are now unlocked.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="flex justify-between border-b border-[#D7E5E2] pb-2 font-mono text-[#566B69]">
              <span>Transaction Ref</span>
              <span className="font-bold text-[#123B3A]">{transactionId}</span>
            </div>
            <div className="flex justify-between border-b border-[#D7E5E2] pb-2">
              <span className="text-[#566B69]">Billed To</span>
              <span className="font-semibold text-[#123B3A]">{business?.name || 'My Business'}</span>
            </div>
            <div className="flex justify-between border-b border-[#D7E5E2] pb-2">
              <span className="text-[#566B69]">Plan & Billing</span>
              <span className="font-semibold text-[#123B3A]">
                {selectedPlan === 'enterprise' ? 'Business Pro' : 'Growth'} ({billingCycle === 'ANNUAL' ? 'Yearly' : 'Monthly'})
              </span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-sm text-[#123B3A]">
              <span>Amount Paid (incl. 18% GST)</span>
              <span className="text-[#0F766E]">{formatCurrency(pricing.total)}</span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button onClick={handleFinish} className="px-8">
              Continue to Workspace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <form id="plan-purchase-form" onSubmit={handleCheckout} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Plan Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#123B3A] uppercase tracking-wider">
              1. Choose Subscription Plan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Growth Plan */}
              <div
                onClick={() => setSelectedPlan('growth')}
                className={`cursor-pointer rounded-xl p-4 border transition-all relative ${
                  selectedPlan === 'growth'
                    ? 'border-[#0F766E] bg-teal-50/40 ring-2 ring-[#0F766E]'
                    : 'border-[#D7E5E2] hover:border-[#A0D2CA] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#123B3A] text-sm">Growth Plan</span>
                  <span className="bg-[#0F766E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                </div>
                <p className="text-xl font-black text-[#0F766E]">
                  ₹499<span className="text-xs font-normal text-[#566B69]">/mo</span>
                </p>
                <p className="text-[11px] text-[#566B69] mt-1.5 leading-snug">
                  Up to 3 staff roles, unlimited invoices, supplier orders, & GSTR reports.
                </p>
              </div>

              {/* Business Pro */}
              <div
                onClick={() => setSelectedPlan('enterprise')}
                className={`cursor-pointer rounded-xl p-4 border transition-all ${
                  selectedPlan === 'enterprise'
                    ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-600'
                    : 'border-[#D7E5E2] hover:border-purple-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#123B3A] text-sm">Business Pro</span>
                  <span className="bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Power
                  </span>
                </div>
                <p className="text-xl font-black text-purple-700">
                  ₹999<span className="text-xs font-normal text-[#566B69]">/mo</span>
                </p>
                <p className="text-[11px] text-[#566B69] mt-1.5 leading-snug">
                  Unlimited staff seats, audited stock adjustments, audit logs, & 24/7 priority support.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Billing Cycle Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl text-xs">
            <div>
              <span className="font-bold text-[#123B3A] block">Billing Cycle</span>
              <span className="text-[11px] text-[#566B69]">Save 20% by paying annually</span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#D7E5E2]">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#566B69] hover:text-[#123B3A]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 ${
                  billingCycle === 'ANNUAL'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-[#566B69] hover:text-[#123B3A]'
                }`}
              >
                Annual <span className="text-[10px] text-amber-300 font-bold">-20%</span>
              </button>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#123B3A] uppercase tracking-wider">
              2. Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'UPI'
                    ? 'border-[#0F766E] bg-teal-50/50 text-[#0F766E] font-bold ring-1 ring-[#0F766E]'
                    : 'border-[#D7E5E2] text-[#566B69] hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="text-xs">UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'CARD'
                    ? 'border-[#0F766E] bg-teal-50/50 text-[#0F766E] font-bold ring-1 ring-[#0F766E]'
                    : 'border-[#D7E5E2] text-[#566B69] hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-xs">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-[#0F766E] bg-teal-50/50 text-[#0F766E] font-bold ring-1 ring-[#0F766E]'
                    : 'border-[#D7E5E2] text-[#566B69] hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs">Net Banking</span>
              </button>
            </div>

            {/* Payment Details Sub-form */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              {paymentMethod === 'UPI' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#123B3A]">
                    UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="mobile@upi or yourname@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D7E5E2] bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-[#566B69]">
                    <span className="bg-white px-2 py-0.5 rounded border border-[#D7E5E2]">Google Pay</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-[#D7E5E2]">PhonePe</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-[#D7E5E2]">Paytm</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-[#D7E5E2]">BHIM</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-medium text-[#123B3A] mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4532 •••• •••• 8892"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D7E5E2] bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-[#123B3A] mb-1">Valid Thru</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#D7E5E2] bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#123B3A] mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#D7E5E2] bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="space-y-2 text-xs">
                  <Select
                    label="Select Bank"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    options={[
                      { label: 'HDFC Bank', value: 'HDFC' },
                      { label: 'State Bank of India', value: 'SBI' },
                      { label: 'ICICI Bank', value: 'ICICI' },
                      { label: 'Axis Bank', value: 'AXIS' },
                      { label: 'Kotak Mahindra Bank', value: 'KOTAK' },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 4. Price Summary & Breakdown */}
          <div className="bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-[#566B69]">
              <span>Base Plan Fee ({billingCycle === 'ANNUAL' ? '12 Months' : '1 Month'})</span>
              <span className="font-semibold text-[#123B3A]">{formatCurrency(pricing.base)}</span>
            </div>
            <div className="flex justify-between text-[#566B69]">
              <span>GST @ 18% (Tax Invoice provided)</span>
              <span className="font-semibold text-[#123B3A]">{formatCurrency(pricing.gst)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#D7E5E2] font-black text-sm text-[#123B3A]">
              <span>Total Amount Due</span>
              <span className="text-[#0F766E]">{formatCurrency(pricing.total)}</span>
            </div>
          </div>

          {/* Security footnote */}
          <div className="flex items-center justify-between text-[11px] text-[#566B69]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span>PCI-DSS Compliant • 256-Bit SSL Encryption</span>
            </div>
            <span>Billed in INR (₹)</span>
          </div>
        </form>
      )}
    </Modal>
  );
};
