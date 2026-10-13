import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency, formatDateReadable } from '@vyora/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { PurchaseRegisterTabProps } from '../config/interface';

export const PurchaseRegisterTab: React.FC<PurchaseRegisterTabProps> = ({ purchaseData }) => {
  const { t } = useTranslation(['reports']);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[650px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] font-semibold bg-[#F4F8F7]/50 dark:bg-[#142B2A]">
              <th className="py-3 px-3">{t('columns.date')}</th>
              <th className="py-3 px-3">{t('columns.billNo')}</th>
              <th className="py-3 px-3">{t('columns.supplier')}</th>
              <th className="py-3 px-3 text-right">{t('columns.subtotal')}</th>
              <th className="py-3 px-3 text-right">{t('columns.taxes')}</th>
              <th className="py-3 px-3 text-right">{t('columns.totalAmount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
            {purchaseData?.items && purchaseData.items.length > 0 ? (
              purchaseData.items.map((p) => (
                <tr key={p.id} className="hover:bg-[#F4F8F7]/60 dark:hover:bg-[#142B2A]/60">
                  <td className="py-3 px-3 text-[#566B69] dark:text-[#8FA8A4]">{formatDateReadable(p.billDate)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">{p.billNumber}</td>
                  <td className="py-3 px-3 font-medium text-[#123B3A] dark:text-[#F0FDFA]">{p.supplierName}</td>
                  <td className="py-3 px-3 text-right font-medium text-[#123B3A] dark:text-[#F0FDFA]">{formatCurrency(p.subtotalMinor)}</td>
                  <td className="py-3 px-3 text-right text-[#566B69] dark:text-[#8FA8A4]">{formatCurrency(p.totalTaxMinor)}</td>
                  <td className="py-3 px-3 text-right font-black text-[#123B3A] dark:text-[#F0FDFA]">
                    {formatCurrency(p.grandTotalMinor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6">
                  <EmptyState
                    icon={ShoppingCart}
                    title={t('empty.purchasesTitle')}
                    description={t('empty.purchasesDesc')}
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
