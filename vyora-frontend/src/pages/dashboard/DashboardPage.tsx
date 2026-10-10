import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FileText,
  AlertCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Plus,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateReadable } from '@vyora/utils';
import { DashboardSummary } from '@vyora/shared-types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { user, business } = useAuth();
  const navigate = useNavigate();

  const { data: metrics, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get<DashboardSummary>('/dashboard/metrics'),
  });

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'paid';
      case 'PARTIAL':
      case 'DRAFT':
        return 'pending';
      case 'UNPAID':
        return 'overdue';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#123B3A] tracking-tight">
            Good Morning, {user?.name?.split(' ')[0] || 'Rahul'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
            Here's what's happening with your business today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D7E5E2] rounded-lg text-xs font-medium text-[#123B3A] shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Today, {todayStr}</span>
          </div>
          <Button
            onClick={() => navigate('/invoices/create')}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
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
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{metrics?.totalSalesChangePercent || 12}% vs last week</span>
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
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{metrics?.totalInvoicesChangePercent || 8}% vs last week</span>
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
            <div className="flex items-center gap-1 mt-1.5 text-xs text-[#B91C1C] font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{metrics?.outstandingReceivablesChangePercent || -5}% vs last week</span>
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
            <div className="flex items-center gap-1 mt-1.5 text-xs text-[#15803D] font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{metrics?.totalStockValueChangePercent || 3}% vs last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Line Card */}
        <div className="lg:col-span-2 bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2]">
            <div>
              <h3 className="text-sm font-bold text-[#123B3A]">Sales Overview</h3>
              <p className="text-xs text-[#566B69]">Authoritative revenue across recorded sales</p>
            </div>
            <span className="text-xs text-[#566B69] bg-[#F4F8F7] px-2.5 py-1 rounded-md border border-[#D7E5E2]">
              Last 7 days
            </span>
          </div>

          <div className="mt-6 h-48 flex items-end gap-3 sm:gap-6 px-2">
            {metrics?.salesTrend?.map((pt, idx) => {
              const max = Math.max(...(metrics?.salesTrend?.map((t) => t.salesMinor) || [100000]), 100000);
              const heightPct = Math.max(12, Math.round((pt.salesMinor / max) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-[#E6F4F2] rounded-t-lg relative flex items-end justify-center h-40">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-[#0F766E] rounded-t-lg transition-all group-hover:bg-[#0D665F]"
                    ></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-[#123B3A] text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none transition-opacity whitespace-nowrap">
                      {formatCurrency(pt.salesMinor)}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#566B69] font-medium">
                    {pt.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales by Category Donut / Breakdown */}
        <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#123B3A]">Sales by Category</h3>
            <p className="text-xs text-[#566B69]">Product category distribution</p>

            <div className="mt-6 flex justify-center items-center">
              <div className="w-36 h-36 rounded-full border-8 border-[#0F766E] border-t-[#123B3A] border-r-[#15803D] border-l-[#A16207] flex flex-col items-center justify-center p-2 text-center bg-[#F4F8F7]/30">
                <span className="text-[10px] text-[#566B69] font-semibold">Total Sales</span>
                <span className="text-xs font-bold text-[#123B3A] mt-0.5">
                  {formatCurrency(metrics?.totalSalesMinor || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {metrics?.salesByCategory?.map((cat, i) => {
              const colors = ['#0F766E', '#123B3A', '#15803D', '#A16207'];
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    ></span>
                    <span className="text-[#123B3A] font-medium">{cat.categoryName}</span>
                  </div>
                  <span className="text-[#566B69] font-semibold">{cat.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Invoices & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-2 bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2]">
            <div>
              <h3 className="text-sm font-bold text-[#123B3A]">Recent Invoices</h3>
              <p className="text-xs text-[#566B69]">Recently issued sales invoices</p>
            </div>
            <Link
              to="/invoices"
              className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold">
                  <th className="py-2.5 px-3">Invoice No.</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {metrics?.recentInvoices && metrics.recentInvoices.length > 0 ? (
                  metrics.recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F4F8F7]/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#0F766E]">
                        <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                      </td>
                      <td className="py-3 px-3 text-[#123B3A] font-medium">{inv.customerName}</td>
                      <td className="py-3 px-3 text-[#566B69]">{formatDateReadable(inv.date)}</td>
                      <td className="py-3 px-3 font-bold text-[#123B3A] text-right">
                        {formatCurrency(inv.amountMinor)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#566B69]">
                      No invoices recorded yet. Click "New Invoice" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white border border-[#D7E5E2] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2]">
            <div>
              <h3 className="text-sm font-bold text-[#123B3A]">Top Products</h3>
              <p className="text-xs text-[#566B69]">Best sellers by volume & revenue</p>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold">
                  <th className="py-2.5 px-2">Product</th>
                  <th className="py-2.5 px-2 text-center">Sold</th>
                  <th className="py-2.5 px-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {metrics?.topProducts && metrics.topProducts.length > 0 ? (
                  metrics.topProducts.map((p) => (
                    <tr key={p.productId} className="hover:bg-[#F4F8F7]/80 transition-colors">
                      <td className="py-3 px-2 font-medium text-[#123B3A] truncate max-w-[130px]">
                        {p.productName}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-[#566B69]">
                        {p.soldQuantity}
                      </td>
                      <td className="py-3 px-2 font-bold text-[#123B3A] text-right">
                        {formatCurrency(p.revenueMinor)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[#566B69]">
                      No sales recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
