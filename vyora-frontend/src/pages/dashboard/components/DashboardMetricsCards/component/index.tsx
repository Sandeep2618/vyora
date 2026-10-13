import React from 'react';
import {
  TrendingUp,
  FileText,
  AlertCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils';
import { DashboardMetricsCardsProps } from '../config/interface';
import {
  DEFAULT_CHANGE_PERCENT_UP,
  DEFAULT_INVOICES_CHANGE_PERCENT,
  DEFAULT_RECEIVABLES_CHANGE_PERCENT,
} from '../config/constant';

export const DashboardMetricsCards: React.FC<DashboardMetricsCardsProps> = ({
  metrics,
  isLoading,
}) => {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Sales */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs transition-colors">
        <div className="flex items-center justify-between text-[#566B69] dark:text-[#8FA8A4] text-xs font-semibold">
          <span>{t('metrics.totalSales')}</span>
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA]">
            {isLoading ? '...' : formatCurrency(metrics?.totalSalesMinor || 0)}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-[#15803D] dark:text-[#34D399] font-medium">
            {metrics?.totalSalesMinor ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>
                  +{metrics?.totalSalesChangePercent || DEFAULT_CHANGE_PERCENT_UP}% {t('metrics.vsLastWeek')}
                </span>
              </>
            ) : (
              <span className="text-[#566B69] dark:text-[#8FA8A4]">{t('metrics.noSalesYet')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Total Invoices */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs transition-colors">
        <div className="flex items-center justify-between text-[#566B69] dark:text-[#8FA8A4] text-xs font-semibold">
          <span>{t('metrics.totalInvoices')}</span>
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA]">
            {isLoading ? '...' : metrics?.totalInvoicesCount || 0}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-[#15803D] dark:text-[#34D399] font-medium">
            {metrics?.totalInvoicesCount ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>
                  +{metrics?.totalInvoicesChangePercent || DEFAULT_INVOICES_CHANGE_PERCENT}% {t('metrics.vsLastWeek')}
                </span>
              </>
            ) : (
              <span className="text-[#566B69] dark:text-[#8FA8A4]">0 {t('metrics.invoicesGenerated')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Outstanding Receivables */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs transition-colors">
        <div className="flex items-center justify-between text-[#566B69] dark:text-[#8FA8A4] text-xs font-semibold">
          <span>{t('metrics.outstandingAmount')}</span>
          <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] dark:bg-[#2A1616] text-[#B91C1C] dark:text-[#F87171] flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA]">
            {isLoading ? '...' : formatCurrency(metrics?.outstandingReceivablesMinor || 0)}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs font-medium">
            {metrics?.outstandingReceivablesMinor ? (
              <div className="flex items-center gap-1 text-[#B91C1C] dark:text-[#F87171]">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>
                  {metrics?.outstandingReceivablesChangePercent || DEFAULT_RECEIVABLES_CHANGE_PERCENT}% {t('metrics.vsLastWeek')}
                </span>
              </div>
            ) : (
              <span className="text-[#15803D] dark:text-[#34D399]">{t('metrics.duesSettled')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Total Stock Value */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs transition-colors">
        <div className="flex items-center justify-between text-[#566B69] dark:text-[#8FA8A4] text-xs font-semibold">
          <span>{t('metrics.totalStockValue')}</span>
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F2] dark:bg-[#162E2D] text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA]">
            {isLoading ? '...' : formatCurrency(metrics?.totalStockValueMinor || 0)}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">
            {metrics?.lowStockCount ? (
              <span className="text-[#B91C1C] dark:text-[#F87171] font-semibold">
                ⚠️ {metrics.lowStockCount} items low on stock
              </span>
            ) : (
              <span>{t('metrics.stockHealthy')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
