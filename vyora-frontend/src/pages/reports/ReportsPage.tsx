import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { PlanPurchaseModal } from '../../components/subscription/PlanPurchaseModal';
import { useAuth } from '../../context/AuthContext';
import { SalesRegisterTab } from './components/SalesRegisterTab';
import { PurchaseRegisterTab } from './components/PurchaseRegisterTab';
import { StockSummaryTab } from './components/StockSummaryTab';
import { CustomerDuesTab } from './components/CustomerDuesTab';

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation(['reports', 'common']);
  const { hasFeature, isOwner } = useAuth();
  const [activeTab, setActiveTab] = useState<'SALES' | 'PURCHASES' | 'STOCK' | 'DUES'>('SALES');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // 1. Sales Register Query
  const { data: salesData } = useQuery<{ items: any[]; summary: any }>({
    queryKey: ['report-sales', startDate, endDate],
    queryFn: () => {
      const q = new URLSearchParams();
      if (startDate) q.set('startDate', startDate);
      if (endDate) q.set('endDate', endDate);
      return api.get(`/reports/sales-register?${q.toString()}`);
    },
    enabled: activeTab === 'SALES' && hasFeature('REPORTS'),
  });

  // 2. Purchase Register Query
  const { data: purchaseData } = useQuery<{ items: any[]; summary: any }>({
    queryKey: ['report-purchases', startDate, endDate],
    queryFn: () => {
      const q = new URLSearchParams();
      if (startDate) q.set('startDate', startDate);
      if (endDate) q.set('endDate', endDate);
      return api.get(`/reports/purchase-register?${q.toString()}`);
    },
    enabled: activeTab === 'PURCHASES' && hasFeature('REPORTS'),
  });

  // 3. Stock Summary Query
  const { data: stockData } = useQuery<{ items: any[]; summary: any }>({
    queryKey: ['report-stock'],
    queryFn: () => api.get('/reports/stock-summary'),
    enabled: activeTab === 'STOCK' && hasFeature('REPORTS'),
  });

  // 4. Customer Dues Query
  const { data: duesData } = useQuery<{ items: any[]; summary: any }>({
    queryKey: ['report-dues'],
    queryFn: () => api.get('/reports/customer-dues'),
    enabled: activeTab === 'DUES' && hasFeature('REPORTS'),
  });

  if (!hasFeature('REPORTS')) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-[#A0D2CA] dark:border-teal-800 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#123B3A] dark:text-[#F0FDFA]">{t('upgrade.title')}</h2>
        <p className="text-xs sm:text-sm text-[#566B69] dark:text-[#8FA8A4] max-w-md mx-auto">
          {t('upgrade.description')}
        </p>
        {isOwner && (
          <>
            <Button onClick={() => setIsPurchaseModalOpen(true)} className="mt-2">
              {t('upgrade.button')}
            </Button>
            <PlanPurchaseModal
              isOpen={isPurchaseModalOpen}
              onClose={() => setIsPurchaseModalOpen(false)}
              targetPlan="growth"
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA]">{t('title')}</h2>
          <p className="text-xs sm:text-sm text-[#566B69] dark:text-[#8FA8A4] mt-0.5">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} className="no-print">
            <Download className="w-4 h-4 mr-1.5" />
            {t('button.printReport')}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs and Date Range Filter */}
      <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#F4F8F7] dark:bg-[#0D1C1B] p-1 rounded-lg border border-[#D7E5E2] dark:border-[#1E3B38] overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('SALES')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'SALES' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]'
              }`}
            >
              {t('tabs.sales')}
            </button>
            <button
              onClick={() => setActiveTab('PURCHASES')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'PURCHASES' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]'
              }`}
            >
              {t('tabs.purchases')}
            </button>
            <button
              onClick={() => setActiveTab('STOCK')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'STOCK' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]'
              }`}
            >
              {t('tabs.stock')}
            </button>
            <button
              onClick={() => setActiveTab('DUES')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'DUES' ? 'bg-[#0F766E] text-white shadow-2xs' : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]'
              }`}
            >
              {t('tabs.dues')}
            </button>
          </div>

          {(activeTab === 'SALES' || activeTab === 'PURCHASES') && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#566B69] dark:text-[#8FA8A4] font-medium">{t('filter.dates')}</span>
              <div className="w-36">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Start Date"
                />
              </div>
              <span className="text-[#566B69] dark:text-[#8FA8A4]">{t('filter.to')}</span>
              <div className="w-36">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="End Date"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      {activeTab === 'SALES' && <SalesRegisterTab salesData={salesData} />}
      {activeTab === 'PURCHASES' && <PurchaseRegisterTab purchaseData={purchaseData} />}
      {activeTab === 'STOCK' && <StockSummaryTab stockData={stockData} />}
      {activeTab === 'DUES' && <CustomerDuesTab duesData={duesData} />}
    </div>
  );
};
