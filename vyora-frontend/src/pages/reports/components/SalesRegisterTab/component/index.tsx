import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { formatCurrency, formatDateReadable } from '@vyora/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { SalesRegisterTabProps } from '../config/interface';

export const SalesRegisterTab: React.FC<SalesRegisterTabProps> = ({ salesData }) => {
  const { t } = useTranslation(['reports']);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-semibold">{t('summary.totalInvoices')}</span>
          <h3 className="text-xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-1">
            {salesData?.summary?.totalInvoices || 0}
          </h3>
        </div>
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-semibold">{t('summary.totalTaxable')}</span>
          <h3 className="text-xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-1">
            {formatCurrency(salesData?.summary?.totalTaxableMinor || 0)}
          </h3>
        </div>
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-semibold">{t('summary.totalTax')}</span>
          <h3 className="text-xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-1">
            {formatCurrency(salesData?.summary?.totalTaxMinor || 0)}
          </h3>
        </div>
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-semibold">{t('summary.netSales')}</span>
          <h3 className="text-xl font-black text-[#0F766E] dark:text-[#14B8A6] mt-1">
            {formatCurrency(salesData?.summary?.totalGrandMinor || 0)}
          </h3>
        </div>
      </div>

      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[750px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] font-semibold bg-[#F4F8F7]/50 dark:bg-[#142B2A]">
              <th className="py-3 px-3">{t('columns.date')}</th>
              <th className="py-3 px-3">{t('columns.invoiceNo')}</th>
              <th className="py-3 px-3">{t('columns.customer')}</th>
              <th className="py-3 px-3 text-right">{t('columns.taxable')}</th>
              <th className="py-3 px-3 text-right">{t('columns.cgst')}</th>
              <th className="py-3 px-3 text-right">{t('columns.sgst')}</th>
              <th className="py-3 px-3 text-right">{t('columns.igst')}</th>
              <th className="py-3 px-3 text-right">{t('columns.totalAmount')}</th>
              <th className="py-3 px-3 text-right">{t('columns.due')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
            {salesData?.items && salesData.items.length > 0 ? (
              salesData.items.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F4F8F7]/60 dark:hover:bg-[#142B2A]/60">
                  <td className="py-3 px-3 text-[#566B69] dark:text-[#8FA8A4]">{formatDateReadable(inv.issueDate)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">{inv.invoiceNumber}</td>
                  <td className="py-3 px-3 font-medium text-[#123B3A] dark:text-[#F0FDFA]">{inv.customerName}</td>
                  <td className="py-3 px-3 text-right font-medium text-[#123B3A] dark:text-[#F0FDFA]">{formatCurrency(inv.taxableMinor)}</td>
                  <td className="py-3 px-3 text-right text-[#566B69] dark:text-[#8FA8A4]">{formatCurrency(inv.cgstMinor)}</td>
                  <td className="py-3 px-3 text-right text-[#566B69] dark:text-[#8FA8A4]">{formatCurrency(inv.sgstMinor)}</td>
                  <td className="py-3 px-3 text-right text-[#566B69] dark:text-[#8FA8A4]">{formatCurrency(inv.igstMinor)}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                    {formatCurrency(inv.grandTotalMinor)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#B91C1C] dark:text-rose-400">
                    {formatCurrency(inv.dueMinor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-6">
                  <EmptyState
                    icon={FileText}
                    title={t('empty.salesTitle')}
                    description={t('empty.salesDesc')}
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
