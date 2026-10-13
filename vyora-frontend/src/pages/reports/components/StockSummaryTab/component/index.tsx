import React from 'react';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import { formatCurrency } from '@vyora/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { StockSummaryTabProps } from '../config/interface';

export const StockSummaryTab: React.FC<StockSummaryTabProps> = ({ stockData }) => {
  const { t } = useTranslation(['reports']);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-semibold">{t('summary.totalStockUnits')}</span>
          <h3 className="text-xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-1">
            {stockData?.summary?.totalStockQty || 0}
          </h3>
        </div>
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] font-semibold">{t('summary.totalValuation')}</span>
          <h3 className="text-xl font-black text-[#0F766E] dark:text-[#14B8A6] mt-1">
            {formatCurrency(stockData?.summary?.totalValuationMinor || 0)}
          </h3>
        </div>
      </div>

      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[680px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] font-semibold bg-[#F4F8F7]/50 dark:bg-[#142B2A]">
              <th className="py-3 px-3">{t('columns.productName')}</th>
              <th className="py-3 px-3">{t('columns.sku')}</th>
              <th className="py-3 px-3 text-center">{t('columns.unit')}</th>
              <th className="py-3 px-3 text-center">{t('columns.currentStock')}</th>
              <th className="py-3 px-3 text-right">{t('columns.costPrice')}</th>
              <th className="py-3 px-3 text-right">{t('columns.valuation')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
            {stockData?.items && stockData.items.length > 0 ? (
              stockData.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F4F8F7]/60 dark:hover:bg-[#142B2A]/60">
                  <td className="py-3 px-3 font-bold text-[#123B3A] dark:text-[#F0FDFA]">{item.name}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">{item.sku}</td>
                  <td className="py-3 px-3 text-center text-[#566B69] dark:text-[#8FA8A4]">{item.unit}</td>
                  <td className="py-3 px-3 text-center font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                    {item.currentStock}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-[#123B3A] dark:text-[#F0FDFA]">
                    {formatCurrency(item.purchasePriceMinor)}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-[#0F766E] dark:text-[#14B8A6]">
                    {formatCurrency(item.valuationMinor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6">
                  <EmptyState
                    icon={Package}
                    title={t('empty.stockTitle')}
                    description={t('empty.stockDesc')}
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
