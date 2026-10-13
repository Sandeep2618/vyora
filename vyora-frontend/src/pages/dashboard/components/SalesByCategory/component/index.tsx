import React from 'react';
import { PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils';
import { SalesByCategoryProps } from '../config/interface';
import { CATEGORY_COLORS } from '../config/constant';

export const SalesByCategory: React.FC<SalesByCategoryProps> = ({
  categories,
  totalSalesMinor = 0,
}) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const hasData = categories && categories.length > 0 && totalSalesMinor > 0;

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA]">{t('salesByCategory.title')}</h3>
        <p className="text-xs text-[#566B69] dark:text-[#8FA8A4]">{t('salesByCategory.subtitle')}</p>

        {hasData ? (
          <div className="mt-6 flex justify-center items-center">
            <div className="w-36 h-36 rounded-full border-8 border-[#0F766E] border-t-[#123B3A] dark:border-t-[#14B8A6] border-r-[#15803D] dark:border-r-[#10B981] border-l-[#A16207] dark:border-l-[#F59E0B] flex flex-col items-center justify-center p-2 text-center bg-[#F4F8F7]/30 dark:bg-[#142B2A]/40 shadow-inner">
              <span className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-semibold">{t('metrics.totalSales')}</span>
              <span className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-0.5">
                {formatCurrency(totalSalesMinor)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center mb-3">
              <PieChart className="w-6 h-6 opacity-80" />
            </div>
            <h4 className="text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA] mb-1">
              {t('empty.noData', { ns: 'common' })}
            </h4>
            <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] max-w-xs leading-relaxed">
              {t('salesOverview.noSalesDesc')}
            </p>
          </div>
        )}
      </div>

      {hasData && (
        <div className="mt-6 space-y-2.5">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                />
                <span className="text-[#123B3A] dark:text-[#F0FDFA] font-medium">{cat.categoryName}</span>
              </div>
              <span className="text-[#566B69] dark:text-[#8FA8A4] font-semibold">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
