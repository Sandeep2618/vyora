import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils';
import { SalesChartProps } from '../config/interface';
import { DEFAULT_MAX_CHART_SALES } from '../config/constant';
import { calculateBarHeightPercent } from '../util';

export const SalesChart: React.FC<SalesChartProps> = ({ salesTrend }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);
  const hasSales =
    salesTrend && salesTrend.length > 0 && salesTrend.some((item) => item.salesMinor > 0);
  const max = Math.max(...(salesTrend?.map((item) => item.salesMinor) || [DEFAULT_MAX_CHART_SALES]), DEFAULT_MAX_CHART_SALES);

  return (
    <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
        <div>
          <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA]">{t('salesOverview.title')}</h3>
          <p className="text-xs text-[#566B69] dark:text-[#8FA8A4]">{t('salesOverview.subtitle')}</p>
        </div>
        <span className="text-xs text-[#566B69] dark:text-[#8FA8A4] bg-[#F4F8F7] dark:bg-[#142B2A] px-2.5 py-1 rounded-md border border-[#D7E5E2] dark:border-[#1E3B38]">
          {t('salesOverview.last7Days')}
        </span>
      </div>

      {!hasSales ? (
        <div className="py-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center mb-3">
            <BarChart2 className="w-6 h-6 opacity-80" />
          </div>
          <h4 className="text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA] mb-1">{t('salesOverview.noSalesTitle')}</h4>
          <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] max-w-sm mb-4 leading-relaxed">
            {t('salesOverview.noSalesDesc')}
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/invoices/create')}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('actions.create', { ns: 'common' })}</span>
          </Button>
        </div>
      ) : (
        <div className="mt-6 h-48 flex items-end gap-3 sm:gap-6 px-2">
          {salesTrend?.map((pt, idx) => {
            const heightPct = calculateBarHeightPercent(pt.salesMinor, max);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-[#E6F4F2] dark:bg-[#162E2D] rounded-t-lg relative flex items-end justify-center h-40">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-[#0F766E] dark:bg-[#14B8A6] rounded-t-lg transition-all group-hover:bg-[#0D665F] dark:group-hover:bg-[#2DD4BF]"
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-[#123B3A] dark:bg-[#091514] text-white dark:text-[#E6F4F1] border border-transparent dark:border-[#1E3B38] text-[10px] py-1 px-2 rounded shadow-md pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {formatCurrency(pt.salesMinor)}
                  </div>
                </div>
                <span className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-medium">
                  {pt.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
