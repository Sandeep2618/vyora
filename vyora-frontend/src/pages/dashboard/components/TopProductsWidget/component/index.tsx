import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils';
import { TopProductsWidgetProps } from '../config/interface';

export const TopProductsWidget: React.FC<TopProductsWidgetProps> = ({ products }) => {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
        <div>
          <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA]">{t('topProducts.title')}</h3>
          <p className="text-xs text-[#566B69] dark:text-[#8FA8A4]">{t('topProducts.subtitle')}</p>
        </div>
        <Link
          to="/products"
          className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1"
        >
          {t('actions.viewAll', { ns: 'common' })} &rarr;
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] font-semibold">
              <th className="py-2.5 px-2">{t('topProducts.product')}</th>
              <th className="py-2.5 px-2 text-center">{t('topProducts.sold')}</th>
              <th className="py-2.5 px-2 text-right">{t('topProducts.revenue')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
            {products && products.length > 0 ? (
              products.map((p) => (
                <tr key={p.productId} className="hover:bg-[#F4F8F7]/80 dark:hover:bg-[#142B2A]/50 transition-colors">
                  <td className="py-3 px-2 font-medium text-[#123B3A] dark:text-[#F0FDFA] truncate max-w-[130px]">
                    {p.productName}
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-[#566B69] dark:text-[#8FA8A4]">
                    {p.soldQuantity}
                  </td>
                  <td className="py-3 px-2 font-bold text-[#123B3A] dark:text-[#F0FDFA] text-right">
                    {formatCurrency(p.revenueMinor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-[#566B69] dark:text-[#8FA8A4]">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-lg bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center mb-2">
                      <span className="text-base font-bold">📦</span>
                    </div>
                    <span className="font-semibold text-[#123B3A] dark:text-[#F0FDFA]">{t('empty.noData', { ns: 'common' })}</span>
                    <span className="text-[11px] text-[#566B69] dark:text-[#8FA8A4] mt-0.5">
                      {t('topProducts.subtitle')}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
