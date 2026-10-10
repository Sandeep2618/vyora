import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { useDashboardMetrics } from '../../hooks/useDashboard';
import { DashboardMetricsCards } from './DashboardMetricsCards';
import { SalesChart } from './SalesChart';
import { SalesByCategory } from './SalesByCategory';
import { RecentInvoicesWidget } from './RecentInvoicesWidget';
import { TopProductsWidget } from './TopProductsWidget';

export const DashboardPage: React.FC = () => {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useDashboardMetrics();

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const firstName = user?.name?.split(' ')[0] || 'Rahul';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <PageHeader
        title={`Good Morning, ${firstName} 👋`}
        description="Here's what's happening with your business today."
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D7E5E2] rounded-lg text-xs font-medium text-[#123B3A] shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Today, {todayStr}</span>
        </div>
        {isOwner && (
          <Button
            onClick={() => navigate('/invoices/create')}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Button>
        )}
      </PageHeader>

      {/* 4 Metric Cards */}
      <DashboardMetricsCards metrics={metrics} isLoading={isLoading} />

      {/* Middle Row: Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart salesTrend={metrics?.salesTrend} />
        <SalesByCategory
          categories={metrics?.salesByCategory}
          totalSalesMinor={metrics?.totalSalesMinor}
        />
      </div>

      {/* Bottom Row: Recent Invoices & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentInvoicesWidget invoices={metrics?.recentInvoices} />
        <TopProductsWidget products={metrics?.topProducts} />
      </div>
    </div>
  );
};
