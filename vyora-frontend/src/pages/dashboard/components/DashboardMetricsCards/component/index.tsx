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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Total Sales */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#A0D2CA] dark:hover:border-[#2A524D] transition-all">
        <div className="flex items-center justify-between text-[#566B69] dark:text-[#8FA8A4] text-xs font-semibold">
          <span>{t('metrics.totalSales')}</span>
          <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <h3 className="text-2xl sm:text-2xl font-black text-[#123B3A] dark:text-[#F0FDFA] tracking-tight">
            {isLoading ? '...' : formatCurrency(metrics?.totalSalesMinor || 0)}
          </h3>
          <div className="mt-2">
            {metrics?.totalSalesMinor ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ArrowUpRight className="w-3 h-3" />
                +{metrics?.totalSalesChangePercent || DEFAULT_CHANGE_PERCENT_UP}% {t('metrics.vsLastWeek')}
              </span>
            ) : (
              <span className="text-xs text-[#566B69] dark:text-[#8FA8A4]">{t('metrics.noSalesYet')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Total Invoices */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#A0D2CA] dark:hover:border-[#2A524D] transition-all">
        <div className="flex items-center justify-between text-[#566B69] dark:text-[#8FA8A4] text-xs font-semibold">
          <span>{t('metrics.totalInvoices')}</span>
          <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <h3 className="text-2xl sm:text-2xl font-black text-[#123B3A] dark:text-[#F0FDFA] tracking-tight">
            {isLoading ? '...' : metrics?.totalInvoicesCount || 0}
          </h3>
          <div className="mt-2">
            {metrics?.totalInvoicesCount ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#14B8A6] border border-[#A0D2CA] dark:border-[#1E4D49]">
                <ArrowUpRight className="w-3 h-3" />
                +{metrics?.totalInvoicesChangePercent || DEFAULT_INVOICES_CHANGE_PERCENT}% {t('metrics.vsLastWeek')}
              </span>
            ) : (
              <span className="text-xs text-[#566B69] dark:text-[#8FA8A4]">0 {t('metrics.invoicesGenerated')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Outstanding Receivables */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#A0D2CA] dark:hover:border-[#2A524D] transition-all">
        <div className="flex items-center justify-between text-[#566B69] dark:text-[#8FA8A4] text-xs font-semibold">
          <span>{t('metrics.outstandingAmount')}</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <h3 className="text-2xl sm:text-2xl font-black text-[#123B3A] dark:text-[#F0FDFA] tracking-tight">
            {isLoading ? '...' : formatCurrency(metrics?.outstandingReceivablesMinor || 0)}
          </h3>
          <div className="mt-2">
            {metrics?.outstandingReceivablesMinor ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <ArrowDownRight className="w-3 h-3" />
                {metrics?.outstandingReceivablesChangePercent || DEFAULT_RECEIVABLES_CHANGE_PERCENT}% {t('metrics.vsLastWeek')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                ✓ {t('metrics.duesSettled')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Total Stock Value */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#A0D2CA] dark:hover:border-[#2A524D] transition-all">
        <div className="flex items-center justify-between text-[#566B69] dark:text-[#8FA8A4] text-xs font-semibold">
          <span>{t('metrics.totalStockValue')}</span>
          <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <h3 className="text-2xl sm:text-2xl font-black text-[#123B3A] dark:text-[#F0FDFA] tracking-tight">
            {isLoading ? '...' : formatCurrency(metrics?.totalStockValueMinor || 0)}
          </h3>
          <div className="mt-2">
            {metrics?.lowStockCount ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                ⚠️ {metrics.lowStockCount} items low
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#14B8A6]">
                ✓ {t('metrics.stockHealthy')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
