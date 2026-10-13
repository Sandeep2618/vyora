import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@vyora/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { CustomerDuesTabProps } from '../config/interface';

export const CustomerDuesTab: React.FC<CustomerDuesTabProps> = ({ duesData }) => {
  const { t } = useTranslation(['reports']);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs">
        <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-semibold">{t('summary.totalOutstanding')}</span>
        <h3 className="text-2xl font-black text-[#B91C1C] dark:text-rose-400 mt-1">
          {formatCurrency(duesData?.summary?.totalDueMinor || 0)}
        </h3>
      </div>

      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[500px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] font-semibold bg-[#F4F8F7]/50 dark:bg-[#142B2A]">
              <th className="py-3 px-4">{t('columns.customerName')}</th>
              <th className="py-3 px-4">{t('columns.phone')}</th>
              <th className="py-3 px-4 text-right">{t('columns.outstandingDue')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
            {duesData?.items && duesData.items.length > 0 ? (
              duesData.items.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F8F7]/60 dark:hover:bg-[#142B2A]/60">
                  <td className="py-3.5 px-4 font-bold text-[#123B3A] dark:text-[#F0FDFA]">{c.name}</td>
                  <td className="py-3.5 px-4 text-[#566B69] dark:text-[#8FA8A4]">{c.phone}</td>
                  <td className="py-3.5 px-4 text-right font-black text-[#B91C1C] dark:text-rose-400">
                    {formatCurrency(c.dueMinor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-6">
                  <EmptyState
                    icon={CheckCircle2}
                    title={t('empty.duesTitle')}
                    description={t('empty.duesDesc')}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
