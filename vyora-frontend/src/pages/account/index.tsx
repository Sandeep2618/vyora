import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PlanPurchaseModal } from '@/components/subscription/modal/PlanPurchaseModal';
import { toast } from '../../components/ui/Toast';
import { SubscriptionPlan } from '@/types';
import { AccountNav } from './components/AccountNav';
import { ProfileTab } from './components/ProfileTab';
import { RolesTab } from './components/RolesTab';
import { BillingTab } from './components/BillingTab';
import { AuditTab } from './components/AuditTab';
import { AccountTabKey } from './config';

export const AccountHubPage: React.FC = () => {
  const { user, business, isOwner, plan, refreshBusiness } = useAuth();
  const { t } = useTranslation('account');
  const { t: tc } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab')?.toUpperCase() as AccountTabKey) || 'PROFILE';
  const [activeTab, setActiveTab] = useState<AccountTabKey>(initialTab);
  const [isPlanPurchaseModalOpen, setIsPlanPurchaseModalOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toUpperCase() as AccountTabKey;
    if (tabParam && ['PROFILE', 'ROLES', 'BILLING', 'AUDIT'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AccountTabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-black text-2xl shadow-md">
            {business?.name ? business.name[0]?.toUpperCase() : 'V'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#123B3A] dark:text-[#E6F4F1]">{business?.name || 'Vyora Enterprise'}</h1>
              <Badge variant={plan === 'enterprise' ? 'paid' : plan === 'growth' ? 'neutral' : 'draft'}>
                {plan === 'enterprise'
                  ? tc('plans.enterprise', { defaultValue: 'BUSINESS PRO' })
                  : plan === 'growth'
                  ? tc('plans.growth', { defaultValue: 'GROWTH' })
                  : tc('plans.starter', { defaultValue: 'STARTER FREE' })}
              </Badge>
            </div>
            <p className="text-xs text-[#566B69] dark:text-slate-400 mt-0.5">
              {t('signedInAs', { defaultValue: 'Signed in as' })}{' '}
              <span className="font-semibold text-[#123B3A] dark:text-[#E6F4F1]">{user?.name}</span> ({user?.email}) •{' '}
              <span className="font-bold text-[#0F766E] dark:text-[#14B8A6]">
                {isOwner
                  ? t('roleOwner', { defaultValue: 'Owner (Full Admin Access)' })
                  : t('roleStaff', { defaultValue: 'Staff Member' })}
              </span>
            </p>
          </div>
        </div>

        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlanPurchaseModalOpen(true)}
            className="flex items-center gap-2 border-[#0F766E] text-[#0F766E] dark:border-[#14B8A6] dark:text-[#14B8A6] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D]"
          >
            <QrCode className="w-4 h-4" />
            <span>{t('renewUpi', { defaultValue: 'Renew / Upgrade via UPI' })}</span>
          </Button>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <AccountNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Panels */}
      {activeTab === 'PROFILE' && <ProfileTab />}
      {activeTab === 'ROLES' && <RolesTab />}
      {activeTab === 'BILLING' && <BillingTab />}
      {activeTab === 'AUDIT' && <AuditTab />}

      {/* Plan Purchase UPI Modal */}
      <PlanPurchaseModal
        isOpen={isPlanPurchaseModalOpen}
        onClose={() => setIsPlanPurchaseModalOpen(false)}
        targetPlan="enterprise"
        onSuccess={async (newPlan: SubscriptionPlan) => {
          setIsPlanPurchaseModalOpen(false);
          await refreshBusiness();
          toast.success(`Subscription upgraded to ${newPlan.toUpperCase()}!`);
        }}
      />
    </div>
  );
};
