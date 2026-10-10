import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, X } from 'lucide-react';
import { Invoice } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { useInvoices, useFinalizeInvoice } from '../../hooks/useInvoices';
import { InvoiceTable } from './InvoiceTable';
import { CancelInvoiceModal } from './CancelInvoiceModal';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'>('ALL');
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'THIS_MONTH' | 'LAST_30'>('ALL');
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
      // Status filter
      let matchesStatus = true;
      if (activeTab === 'PAID') matchesStatus = inv.status === 'PAID';
      else if (activeTab === 'PENDING') matchesStatus = inv.status === 'PARTIAL' || inv.status === 'DRAFT';
      else if (activeTab === 'OVERDUE') matchesStatus = inv.status === 'UNPAID';
      else if (activeTab === 'CANCELLED') matchesStatus = inv.status === 'CANCELLED';

      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerSnapshot.name.toLowerCase().includes(q) ||
        (inv.customerSnapshot.phone && inv.customerSnapshot.phone.includes(q));

      // Timeframe filter
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
        title="Invoices"
        description="Manage and track all your sales invoices in one place"
      >
        <Button
          onClick={() => navigate('/invoices/create')}
          className="flex items-center gap-1.5 shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </Button>
      </PageHeader>

      <Card className="p-3.5 sm:p-5 space-y-4">
        {/* Responsive Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs and Filter Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#F4F8F7] p-1 rounded-xl border border-[#D7E5E2] overflow-x-auto max-w-full">
              {(['ALL', 'PAID', 'PENDING', 'OVERDUE', 'CANCELLED'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'text-[#566B69] hover:text-[#123B3A]'
                  }`}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 shrink-0 ${
                showFilters || timeFilter !== 'ALL'
                  ? 'bg-[#E6F4F2] border-[#0F766E] text-[#0F766E]'
                  : 'bg-[#F4F8F7] border-[#D7E5E2] text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Date Filter</span>
              {timeFilter !== 'ALL' && <span className="w-2 h-2 rounded-full bg-[#0F766E]" />}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Bar: Full width on mobile/tablet, right aligned on desktop */}
          <div className="w-full lg:w-72 shrink-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search invoice number, customer..."
            />
          </div>
        </div>

        {/* Date Filter Toolbar Drawer */}
        {showFilters && (
          <div className="p-3.5 bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl flex items-center gap-3 animate-in fade-in flex-wrap">
            <span className="text-xs font-bold text-[#123B3A]">Issue Date Range:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'All Time', val: 'ALL' },
                { label: 'Today', val: 'TODAY' },
                { label: 'This Month', val: 'THIS_MONTH' },
                { label: 'Last 30 Days', val: 'LAST_30' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setTimeFilter(opt.val as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    timeFilter === opt.val
                      ? 'bg-[#0F766E] text-white shadow-2xs font-semibold'
                      : 'bg-white border border-[#D7E5E2] text-[#566B69] hover:text-[#123B3A]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <InvoiceTable
          invoices={filteredInvoices}
          isLoading={isLoading}
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
