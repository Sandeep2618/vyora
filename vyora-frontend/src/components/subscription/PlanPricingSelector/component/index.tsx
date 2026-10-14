import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@vyora/utils';
import { PlanPricingSelectorProps } from '../config/interface';

export const PlanPricingSelector: React.FC<PlanPricingSelectorProps> = ({
  selectedPlan,
  onSelectPlan,
  billingCycle,
  onBillingCycleChange,
  pricing,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-4">
      {/* 1. Plan Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#123B3A] dark:text-[#E6F4F1] uppercase tracking-wider">
          {t('planPurchaseModal.step1Choose', { defaultValue: '1. Choose Subscription Plan' })}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Growth Plan */}
          <div
            onClick={() => onSelectPlan('growth')}
            className={`cursor-pointer rounded-xl p-4 border transition-all relative ${
              selectedPlan === 'growth'
                ? 'border-[#0F766E] bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-[#0F766E]'
                : 'border-[#D7E5E2] dark:border-[#1E3B38] hover:border-[#A0D2CA] bg-white dark:bg-[#112322]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[#123B3A] dark:text-[#E6F4F1] text-sm">
                {t('planPurchaseModal.growthPlan', { defaultValue: 'Growth Plan' })}
              </span>
              <span className="bg-[#0F766E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {t('status.popular', { defaultValue: 'Popular' })}
              </span>
            </div>
            <p className="text-xl font-black text-[#0F766E] dark:text-[#14B8A6]">
              ₹499<span className="text-xs font-normal text-[#566B69] dark:text-slate-400">/mo</span>
            </p>
            <p className="text-[11px] text-[#566B69] dark:text-slate-400 mt-1.5 leading-snug">
              {t('planPurchaseModal.growthPlanDesc', { defaultValue: 'Up to 3 staff roles, unlimited invoices, supplier orders, & GSTR reports.' })}
            </p>
          </div>

          {/* Business Pro */}
          <div
            onClick={() => onSelectPlan('enterprise')}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedPlan === 'enterprise'
                ? 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 ring-2 ring-purple-600'
                : 'border-[#D7E5E2] dark:border-[#1E3B38] hover:border-purple-200 bg-white dark:bg-[#112322]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[#123B3A] dark:text-[#E6F4F1] text-sm">
                {t('planPurchaseModal.businessPro', { defaultValue: 'Business Pro' })}
              </span>
              <span className="bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {t('status.power', { defaultValue: 'Power' })}
              </span>
            </div>
            <p className="text-xl font-black text-purple-700 dark:text-purple-400">
              ₹999<span className="text-xs font-normal text-[#566B69] dark:text-slate-400">/mo</span>
            </p>
            <p className="text-[11px] text-[#566B69] dark:text-slate-400 mt-1.5 leading-snug">
              {t('planPurchaseModal.businessProDesc', { defaultValue: 'Unlimited staff seats, audited stock adjustments, audit logs, & 24/7 priority support.' })}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Billing Cycle Toggle */}
      <div className="flex items-center justify-between p-3 bg-[#F4F8F7] dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl text-xs">
        <div>
          <span className="font-bold text-[#123B3A] dark:text-[#E6F4F1] block">
            {t('planPurchaseModal.billingCycle', { defaultValue: 'Billing Cycle' })}
          </span>
          <span className="text-[11px] text-[#566B69] dark:text-slate-400">
            {t('planPurchaseModal.save20', { defaultValue: 'Save 20% by paying annually' })}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-[#162E2D] p-1 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38]">
          <button
            type="button"
            onClick={() => onBillingCycleChange('MONTHLY')}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
              billingCycle === 'MONTHLY'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-200'
            }`}
          >
            {t('planPurchaseModal.monthly', { defaultValue: 'Monthly' })}
          </button>
          <button
            type="button"
            onClick={() => onBillingCycleChange('ANNUAL')}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 ${
              billingCycle === 'ANNUAL'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-200'
            }`}
          >
            {t('planPurchaseModal.annual', { defaultValue: 'Annual' })} <span className="text-[10px] text-amber-500 font-bold">{t('planPurchaseModal.save20Badge', { defaultValue: '-20%' })}</span>
          </button>
        </div>
      </div>

      {/* Price Summary & Breakdown */}
      <div className="bg-[#F4F8F7] dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 space-y-2 text-xs">
        <div className="flex justify-between text-[#566B69] dark:text-slate-400">
          <span>
            {t('planPurchaseModal.basePlanFee', {
              period: billingCycle === 'ANNUAL' ? t('planPurchaseModal.period12', { defaultValue: '12 Months' }) : t('planPurchaseModal.period1', { defaultValue: '1 Month' }),
              defaultValue: `Base Plan Fee (${billingCycle === 'ANNUAL' ? '12 Months' : '1 Month'})`,
            })}
          </span>
          <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">{formatCurrency(pricing.base)}</span>
        </div>
        <div className="flex justify-between text-[#566B69] dark:text-slate-400">
          <span>{t('planPurchaseModal.gstTax', { defaultValue: 'GST @ 18% (Tax Invoice provided)' })}</span>
          <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">{formatCurrency(pricing.gst)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-[#D7E5E2] dark:border-[#1E3B38] font-black text-sm text-[#123B3A] dark:text-[#E6F4F1]">
          <span>{t('planPurchaseModal.totalDue', { defaultValue: 'Total Amount Due' })}</span>
          <span className="text-[#0F766E] dark:text-[#14B8A6]">{formatCurrency(pricing.total)}</span>
        </div>
      </div>
    </div>
  );
};
