import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Invoice } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useInvoices, useFinalizeInvoice } from '../../hooks/useInvoices';
import { InvoiceTabFilter, InvoiceTimeFilter } from './config';
import { InvoiceFilterToolbar } from './components/list/InvoiceFilterToolbar';
import { InvoiceTable } from './components/list/InvoiceTable';
import { CancelInvoiceModal } from './components/list/modal';

export const InvoiceListPage: React.FC = () => {
  const { isOwner } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['invoices', 'common']);
  const [activeTab, setActiveTab] = useState<InvoiceTabFilter>('ALL');
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<InvoiceTimeFilter>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [cancelingInvoice, setCancelingInvoice] = useState<Invoice | null>(null);

  const { data, isLoading } = useInvoices();
  const finalizeMutation = useFinalizeInvoice();

  // Instant client-side filtering
  const filteredInvoices = useMemo(() => {
    if (!data?.items) return [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return data.items.filter((inv) => {
      let matchesStatus = true;
      if (activeTab === 'PAID') matchesStatus = inv.status === 'PAID';
      else if (activeTab === 'PENDING') matchesStatus = inv.status === 'PARTIAL' || inv.status === 'DRAFT';
      else if (activeTab === 'OVERDUE') matchesStatus = inv.status === 'UNPAID';
      else if (activeTab === 'CANCELLED') matchesStatus = inv.status === 'CANCELLED';

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerSnapshot.name.toLowerCase().includes(q) ||
        (inv.customerSnapshot.phone && inv.customerSnapshot.phone.includes(q));

      let matchesTime = true;
      const invDate = new Date(inv.issueDate);
      if (timeFilter === 'TODAY') {
        matchesTime = inv.issueDate.startsWith(todayStr);
      } else if (timeFilter === 'THIS_MONTH') {
        matchesTime = invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      } else if (timeFilter === 'LAST_30') {
        matchesTime = invDate >= thirtyDaysAgo;
      }

      return matchesStatus && matchesSearch && matchesTime;
    });
  }, [data?.items, activeTab, search, timeFilter]);

  const hasActiveFilters = activeTab !== 'ALL' || timeFilter !== 'ALL' || search !== '';

  const clearAllFilters = () => {
    setActiveTab('ALL');
    setTimeFilter('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      >
        {isOwner && (
          <Button
            onClick={() => navigate('/invoices/create')}
            className="flex items-center gap-1.5 shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actions.newInvoice', { ns: 'common' })}</span>
          </Button>
        )}
      </PageHeader>

      <Card className="p-3.5 sm:p-5 space-y-4">
        {Boolean((data?.items && data.items.length > 0) || hasActiveFilters) && (
          <InvoiceFilterToolbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            search={search}
            setSearch={setSearch}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
          />
        )}

        <InvoiceTable
          invoices={filteredInvoices}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          isOwner={isOwner}
          onResetFilters={clearAllFilters}
          onFinalize={(id) => finalizeMutation.mutate(id)}
          onCancelClick={(inv) => setCancelingInvoice(inv)}
          onCreateClick={() => navigate('/invoices/create')}
        />
      </Card>

      <CancelInvoiceModal
        invoice={cancelingInvoice}
        onClose={() => setCancelingInvoice(null)}
      />
    </div>
  );
};

export * from './create';
export * from './view';
