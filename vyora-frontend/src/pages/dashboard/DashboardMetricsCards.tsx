import React from 'react';
import { TrendingUp, FileText, AlertCircle, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardSummary } from '../../types';
import { formatCurrency } from '../../utils';

interface DashboardMetricsCardsProps {
  metrics?: DashboardSummary;
  isLoading: boolean;
}

export const DashboardMetricsCards: React.FC<DashboardMetricsCardsProps> = ({
  metrics,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Sales */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between text-[#566B69] text-xs font-semibold">
          <span>Total Sales</span>
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-[#123B3A]">
            {isLoading ? '...' : formatCurrency(metrics?.totalSalesMinor || 0)}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-[#15803D] font-medium">
            {metrics?.totalSalesMinor ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{metrics?.totalSalesChangePercent || 12}% vs last week</span>
              </>
            ) : (
              <span className="text-[#566B69]">No sales recorded yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Total Invoices */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between text-[#566B69] text-xs font-semibold">
          <span>Total Invoices</span>
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-[#123B3A]">
            {isLoading ? '...' : metrics?.totalInvoicesCount || 0}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-[#15803D] font-medium">
            {metrics?.totalInvoicesCount ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+{metrics?.totalInvoicesChangePercent || 8}% vs last week</span>
              </>
            ) : (
              <span className="text-[#566B69]">0 invoices generated</span>
            )}
          </div>
        </div>
      </div>

      {/* Outstanding Receivables */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between text-[#566B69] text-xs font-semibold">
          <span>Outstanding Amount</span>
          <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-[#123B3A]">
            {isLoading ? '...' : formatCurrency(metrics?.outstandingReceivablesMinor || 0)}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs font-medium">
            {metrics?.outstandingReceivablesMinor ? (
              <div className="flex items-center gap-1 text-[#B91C1C]">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>{metrics?.outstandingReceivablesChangePercent || -5}% vs last week</span>
              </div>
            ) : (
              <span className="text-[#15803D]">All customer dues settled</span>
            )}
          </div>
        </div>
      </div>

      {/* Total Stock Value */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between text-[#566B69] text-xs font-semibold">
          <span>Total Stock Value</span>
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-[#123B3A]">
            {isLoading ? '...' : formatCurrency(metrics?.totalStockValueMinor || 0)}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-[#566B69] font-medium">
            {metrics?.lowStockCount ? (
              <span className="text-[#B91C1C] font-semibold">
                ⚠️ {metrics.lowStockCount} items low on stock
              </span>
            ) : (
              <span>Inventory levels healthy</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
