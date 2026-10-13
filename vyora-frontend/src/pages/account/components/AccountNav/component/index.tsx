import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldCheck, CreditCard, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountNavProps } from '../config/interface';
import {
  ACCOUNT_NAV_ACTIVE_CLASSES,
  ACCOUNT_NAV_INACTIVE_CLASSES,
} from '../config/constant';

export const AccountNav: React.FC<AccountNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation('account');

  return (
    <div className="flex border-b border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => onTabChange('PROFILE')}
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0 cursor-pointer',
          activeTab === 'PROFILE'
            ? ACCOUNT_NAV_ACTIVE_CLASSES
            : ACCOUNT_NAV_INACTIVE_CLASSES,
        )}
      >
        <Building2 className="w-4 h-4" />
        <span>{t('tabs.profile', { defaultValue: 'Business & User Profile' })}</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('ROLES')}
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0 cursor-pointer',
          activeTab === 'ROLES'
            ? ACCOUNT_NAV_ACTIVE_CLASSES
            : ACCOUNT_NAV_INACTIVE_CLASSES,
        )}
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{t('tabs.roles', { defaultValue: 'Roles & Module Rights' })}</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('BILLING')}
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0 cursor-pointer',
          activeTab === 'BILLING'
            ? ACCOUNT_NAV_ACTIVE_CLASSES
            : ACCOUNT_NAV_INACTIVE_CLASSES,
        )}
      >
        <CreditCard className="w-4 h-4" />
        <span>{t('tabs.billing', { defaultValue: 'Billing & Plans' })}</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('AUDIT')}
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0 cursor-pointer',
          activeTab === 'AUDIT'
            ? ACCOUNT_NAV_ACTIVE_CLASSES
            : ACCOUNT_NAV_INACTIVE_CLASSES,
        )}
      >
        <History className="w-4 h-4" />
        <span>{t('tabs.audit', { defaultValue: 'Audit Activity Log' })}</span>
      </button>
    </div>
  );
};
