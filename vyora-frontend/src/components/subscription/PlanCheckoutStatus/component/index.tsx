import React from 'react';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@vyora/utils';
import { Button } from '@/components/ui/Button';
import { PlanCheckoutStatusProps } from '../config/interface';

export const PlanCheckoutStatus: React.FC<PlanCheckoutStatusProps> = ({
  step,
  totalMinor,
  selectedPlan,
  billingCycle,
  businessName,
  transactionId,
  onFinish,
}) => {
  if (step === 'PROCESSING') {
    return (
      <div className="py-14 text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="w-16 h-16 border-4 border-[#A0D2CA] border-t-[#0F766E] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#0F766E]" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#123B3A] dark:text-[#E6F4F1]">
            Connecting to Indian Banking Gateway...
          </h3>
          <p className="text-xs text-[#566B69] dark:text-slate-400">
            Authorizing {formatCurrency(totalMinor)} via 256-bit encrypted checkout. Please do not refresh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 text-center">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400 shadow-xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-[#123B3A] dark:text-[#E6F4F1]">
          Payment Successful & Plan Activated!
        </h3>
        <p className="text-xs sm:text-sm text-[#566B69] dark:text-slate-400 max-w-md mx-auto">
          Your business is now upgraded to the{' '}
          <strong className="text-[#0F766E] dark:text-[#14B8A6]">
            {selectedPlan === 'enterprise' ? 'Business Pro' : 'Growth Plan'}
          </strong>
          . All features, team role assignments, and reports are now unlocked.
        </p>
      </div>

      {/* Receipt Card */}
      <div className="bg-[#F4F8F7] dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
        <div className="flex justify-between border-b border-[#D7E5E2] dark:border-[#1E3B38] pb-2 font-mono text-[#566B69] dark:text-slate-400">
          <span>Transaction Ref</span>
          <span className="font-bold text-[#123B3A] dark:text-[#E6F4F1]">{transactionId}</span>
        </div>
        <div className="flex justify-between border-b border-[#D7E5E2] dark:border-[#1E3B38] pb-2">
          <span className="text-[#566B69] dark:text-slate-400">Billed To</span>
          <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">{businessName || 'My Business'}</span>
        </div>
        <div className="flex justify-between border-b border-[#D7E5E2] dark:border-[#1E3B38] pb-2">
          <span className="text-[#566B69] dark:text-slate-400">Plan & Billing</span>
          <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
            {selectedPlan === 'enterprise' ? 'Business Pro' : 'Growth'} ({billingCycle === 'ANNUAL' ? 'Yearly' : 'Monthly'})
          </span>
        </div>
        <div className="flex justify-between pt-1 font-bold text-sm text-[#123B3A] dark:text-[#E6F4F1]">
          <span>Amount Paid (incl. 18% GST)</span>
          <span className="text-[#0F766E] dark:text-[#14B8A6]">{formatCurrency(totalMinor)}</span>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button onClick={onFinish} className="px-8">
          Continue to Workspace
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
