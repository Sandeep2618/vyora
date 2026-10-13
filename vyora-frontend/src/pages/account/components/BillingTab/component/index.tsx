import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionPlan } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlanPurchaseModal } from '@/components/subscription/PlanPurchaseModal';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export const BillingTab: React.FC = () => {
  const { t } = useTranslation('account');
  const { plan, isOwner, updateSubscriptionPlan, refreshBusiness } = useAuth();
  const [isPlanPurchaseModalOpen, setIsPlanPurchaseModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan>('growth');

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <div className="bg-[#123B3A] dark:bg-[#091514] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#1C4E4C] dark:border-[#132A29]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#A0BDB8]">
              {t('billingTab.activePlan', { defaultValue: 'Active Plan' })}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#0A1615]">
              {t('billingTab.live', { defaultValue: 'LIVE' })}
            </span>
          </div>
          <h2 className="text-2xl font-black mt-1">
            {plan === 'enterprise'
              ? t('billingTab.proTitle', { defaultValue: 'Business Pro Cloud' })
              : plan === 'growth'
                ? t('billingTab.growthTitle', { defaultValue: 'Growth Business Plan' })
                : t('billingTab.starterTitle', { defaultValue: 'Starter Free Plan' })}
          </h2>
          <p className="text-xs text-[#A0BDB8] mt-1 max-w-xl">
            {t('billingTab.multiUserNotice', {
              defaultValue:
                'Multi-user business subscription with real-time cloud database synchronization. All invoices, stock deductions, and customer balances are instantly available across web and mobile apps.',
            })}
          </p>
        </div>

        {isOwner && (
          <Button
            variant="primary"
            onClick={() => {
              setSelectedPlanForUpgrade('enterprise');
              setIsPlanPurchaseModalOpen(true);
            }}
            className="bg-[#0F766E] hover:bg-[#0D665F] text-white flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>{t('billingTab.instantRenewUpi', { defaultValue: 'Instant Bharat UPI Renewal' })}</span>
          </Button>
        )}
      </div>

      {/* 3-Tier Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Starter Free */}
        <div
          className={cn(
            'bg-white dark:bg-[#112322] border rounded-2xl p-5 shadow-xs flex flex-col justify-between',
            plan === 'starter'
              ? 'border-[#0F766E] dark:border-[#14B8A6] ring-2 ring-[#0F766E]/20 dark:ring-[#14B8A6]/20'
              : 'border-[#D7E5E2] dark:border-[#1E3B38]',
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#123B3A] dark:text-[#E6F4F1]">
                {t('billingTab.starterTitle', { defaultValue: 'Starter Plan' })}
              </h3>
              {plan === 'starter' && <Badge variant="paid">{t('billingTab.currentBadge', { defaultValue: 'Current' })}</Badge>}
            </div>
            <div className="text-2xl font-black text-[#123B3A] dark:text-[#E6F4F1] mb-1">
              {t('billingTab.starterFree', { defaultValue: 'Free' })}
            </div>
            <p className="text-[11px] text-[#566B69] dark:text-slate-400 mb-4">
              {t('billingTab.starterDesc', { defaultValue: 'Forever free for small shops and solo counters.' })}
            </p>

            <ul className="space-y-2 text-xs text-[#123B3A] dark:text-[#E6F4F1]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{t('billingTab.features.starterInvoices', { defaultValue: 'Up to 50 GST Sales Invoices / mo' })}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{t('billingTab.features.starterCatalog', { defaultValue: 'Product Catalog & Customers' })}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{t('billingTab.features.starterOwner', { defaultValue: '1 Business Owner Account' })}</span>
              </li>
              <li className="flex items-center gap-2 text-[#8CA19F] dark:text-slate-500">
                <span className="w-4 h-4 text-center">✕</span>
                <span>{t('billingTab.features.starterNoModules', { defaultValue: 'No Purchase or Report Modules' })}</span>
              </li>
            </ul>
          </div>

          {plan !== 'starter' && isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSubscriptionPlan('starter')}
              className="mt-6 w-full"
            >
              {t('billingTab.downgradeFree', { defaultValue: 'Downgrade to Free' })}
            </Button>
          )}
        </div>

        {/* Growth */}
        <div
          className={cn(
            'bg-white dark:bg-[#112322] border rounded-2xl p-5 shadow-xs flex flex-col justify-between',
            plan === 'growth'
              ? 'border-[#0F766E] dark:border-[#14B8A6] ring-2 ring-[#0F766E]/20 dark:ring-[#14B8A6]/20'
              : 'border-[#D7E5E2] dark:border-[#1E3B38]',
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#123B3A] dark:text-[#E6F4F1]">
                {t('billingTab.growthTitle', { defaultValue: 'Growth Plan' })}
              </h3>
              {plan === 'growth' && <Badge variant="paid">{t('billingTab.currentBadge', { defaultValue: 'Current' })}</Badge>}
            </div>
            <div className="text-2xl font-black text-[#0F766E] dark:text-[#14B8A6] mb-1">
              ₹999 <span className="text-xs text-[#566B69] dark:text-slate-400 font-normal">{t('billingTab.perYear', { defaultValue: '/ year' })}</span>
            </div>
            <p className="text-[11px] text-[#566B69] dark:text-slate-400 mb-4">
              {t('billingTab.growthDesc', { defaultValue: 'Ideal for retail shops & growing trading businesses.' })}
            </p>

            <ul className="space-y-2 text-xs text-[#123B3A] dark:text-[#E6F4F1]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{t('billingTab.features.growthInvoices', { defaultValue: 'Unlimited GST Sales Invoices' })}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{t('billingTab.features.growthModules', { defaultValue: 'Purchases, Expenses & Reports' })}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{t('billingTab.features.growthStaff', { defaultValue: 'Up to 3 Team Staff Members' })}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{t('billingTab.features.growthUpi', { defaultValue: 'Bharat UPI QR Counter Payments' })}</span>
              </li>
            </ul>
          </div>

          {plan !== 'growth' && isOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedPlanForUpgrade('growth');
                setIsPlanPurchaseModalOpen(true);
              }}
              className="mt-6 w-full"
            >
              {t('billingTab.switchToGrowth', { defaultValue: 'Switch to Growth (₹999/yr)' })}
            </Button>
          )}
        </div>

        {/* Business Pro */}
        <div
          className={cn(
            'bg-white dark:bg-[#112322] border rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden',
            plan === 'enterprise'
              ? 'border-purple-600 dark:border-purple-500 ring-2 ring-purple-600/20 dark:ring-purple-500/20'
              : 'border-[#D7E5E2] dark:border-[#1E3B38]',
          )}
        >
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg">
            {t('billingTab.recommendedBadge', { defaultValue: 'RECOMMENDED' })}
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#123B3A] dark:text-[#E6F4F1]">
                {t('billingTab.proTitle', { defaultValue: 'Business Pro' })}
              </h3>
              {plan === 'enterprise' && <Badge variant="paid">{t('billingTab.currentBadge', { defaultValue: 'Current' })}</Badge>}
            </div>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mb-1">
              ₹1,999 <span className="text-xs text-[#566B69] dark:text-slate-400 font-normal">{t('billingTab.perYear', { defaultValue: '/ year' })}</span>
            </div>
            <p className="text-[11px] text-[#566B69] dark:text-slate-400 mb-4">
              {t('billingTab.proDesc', { defaultValue: 'Complete enterprise power for multi-counter operations.' })}
            </p>

            <ul className="space-y-2 text-xs text-[#123B3A] dark:text-[#E6F4F1]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t('billingTab.features.proStaff', { defaultValue: 'Unlimited Staff & Multi-Counter Sync' })}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t('billingTab.features.proRights', { defaultValue: 'Granular Staff Module-Rights Control' })}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t('billingTab.features.proAudit', { defaultValue: 'Full Audit Trail & Stock Adjustments' })}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t('billingTab.features.proSupport', { defaultValue: 'Priority Support & Mobile Sync' })}</span>
              </li>
            </ul>
          </div>

          {plan !== 'enterprise' && isOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedPlanForUpgrade('enterprise');
                setIsPlanPurchaseModalOpen(true);
              }}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {t('billingTab.upgradeToPro', { defaultValue: 'Upgrade to Pro (₹1,999/yr)' })}
            </Button>
          )}
        </div>
      </div>

      {/* Plan Purchase UPI Modal */}
      <PlanPurchaseModal
        isOpen={isPlanPurchaseModalOpen}
        onClose={() => setIsPlanPurchaseModalOpen(false)}
        targetPlan={selectedPlanForUpgrade}
        onSuccess={async (newPlan) => {
          setIsPlanPurchaseModalOpen(false);
          await refreshBusiness();
          toast.success(t('upgradeSuccess', { defaultValue: `Subscription upgraded to ${newPlan.toUpperCase()}!` }));
        }}
      />
    </div>
  );
};
