import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDashboardMetrics } from '@/hooks/useDashboard';
import { DashboardMetricsCards } from './components/DashboardMetricsCards';
import { SalesChart } from './components/SalesChart';
import { SalesByCategory } from './components/SalesByCategory';
import { RecentInvoicesWidget } from './components/RecentInvoicesWidget';
import { TopProductsWidget } from './components/TopProductsWidget';

export const DashboardPage: React.FC = () => {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useDashboardMetrics();
  const { t } = useTranslation(['dashboard', 'common']);

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'greetingMorning' : hour < 17 ? 'greetingAfternoon' : 'greetingEvening';
  const firstName = user?.name ? user.name.split(' ')[0] : '';
  const greetingTitle = `${t(greetingKey)}, ${firstName} 👋`;

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <PageHeader
        title={greetingTitle}
        description={t('subGreeting')}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs font-medium text-[#123B3A] dark:text-[#E6F4F1] shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
          <span>{todayStr}</span>
        </div>
        {isOwner && (
          <Button
            onClick={() => navigate('/invoices/create')}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actions.createInvoice', { ns: 'common' })}</span>
          </Button>
        )}
      </PageHeader>

      {/* Metrics Row */}
      <DashboardMetricsCards metrics={metrics} isLoading={isLoading} />

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <SalesByCategory />
        </div>
      </div>

      {/* Lower Row: Recent Invoices & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentInvoicesWidget />
        </div>
        <div>
          <TopProductsWidget />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
