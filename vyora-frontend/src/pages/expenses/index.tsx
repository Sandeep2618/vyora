import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { toast } from '../../components/ui/Toast';
import { ExpenseRecord } from '../../types';
import { expensesApi, CreateExpensePayload } from '../../api/expenses';
import { RecordExpenseModal } from './components/RecordExpenseModal';
import { ExpensesTable } from './components/ExpensesTable';
import { formatCurrency, formatDateReadable } from '../../utils';

export const ExpensesPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'ALL'>('CATEGORIES');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadExpenses = async () => {
    try {
      const data = await expensesApi.list({ limit: 200 });
      setExpenses(data.items || []);
    } catch (err: any) {
      toast.error('Could not load expenses list.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadExpenses();
  };

  const handleCreateExpense = async (payload: CreateExpensePayload) => {
    const created = await expensesApi.create(payload);
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const handleDeleteExpense = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete expense for ${name}?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await expensesApi.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success('Expense deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete expense.');
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics calculations
  const totalExpenseMinor = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (item.amountMinor || 0), 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { totalMinor: number; count: number }>();
    expenses.forEach((item) => {
      const cat = item.category || 'Miscellaneous';
      const existing = map.get(cat) || { totalMinor: 0, count: 0 };
      map.set(cat, {
        totalMinor: existing.totalMinor + (item.amountMinor || 0),
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        totalAmountMinor: data.totalMinor,
        count: data.count,
        percent: totalExpenseMinor > 0 ? (data.totalMinor / totalExpenseMinor) * 100 : 0,
      }))
      .sort((a, b) => b.totalAmountMinor - a.totalAmountMinor);
  }, [expenses, totalExpenseMinor]);

  const topCategory = categoryBreakdown[0]?.name || 'N/A';

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    if (selectedCategoryFilter === 'ALL') return expenses;
    return expenses.filter((item) => item.category === selectedCategoryFilter);
  }, [expenses, selectedCategoryFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title={t('navigation.expenses', { defaultValue: 'Expenses & Overheads' })}
        description="Record petty cash, store rents, utility bills, logistics and operational costs"
      >
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Button
          variant="primary"
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </Button>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">
            <span>Total Overheads</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-2">
            {isLoading ? '...' : formatCurrency(totalExpenseMinor)}
          </div>
          <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] mt-1">
            Recorded across {expenses.length} transactions
          </p>
        </div>

        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">
            <span>Top Cost Category</span>
            <Layers className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          </div>
          <div className="text-xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-2 truncate">
            {isLoading ? '...' : topCategory}
          </div>
          <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] mt-1">
            {categoryBreakdown[0]
              ? `${formatCurrency(categoryBreakdown[0].totalAmountMinor)} (${categoryBreakdown[0].percent.toFixed(1)}%)`
              : 'No expenses yet'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#566B69] dark:text-[#8FA8A4] font-medium">
            <span>Active Categories</span>
            <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-[#123B3A] dark:text-[#F0FDFA] mt-2">
            {categoryBreakdown.length}
          </div>
          <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] mt-1">
            Distinct operational cost heads
          </p>
        </div>
      </div>

      {/* Tabs and Controls */}
      <Card className="p-3.5 sm:p-5 space-y-4">
        {/* Top Controls: Tab Selector & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-[#F4F8F7] dark:bg-[#162E2D] rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('CATEGORIES')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'CATEGORIES'
                  ? 'bg-white dark:bg-[#112322] text-[#0F766E] dark:text-[#14B8A6] shadow-xs'
                  : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#E6F4F1]'
              }`}
            >
              Category Breakdown ({categoryBreakdown.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-[#112322] text-[#0F766E] dark:text-[#14B8A6] shadow-xs'
                  : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#E6F4F1]'
              }`}
            >
              All Records ({expenses.length})
            </button>
          </div>

          {/* Category Filter */}
          <div className="w-48 self-end sm:self-auto">
            <Select
              size="sm"
              value={selectedCategoryFilter}
              onValueChange={(val) => setSelectedCategoryFilter(val)}
              options={[
                { label: 'All Categories', value: 'ALL' },
                ...categoryBreakdown.map((cat) => ({
                  label: cat.name,
                  value: cat.name,
                })),
              ]}
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'CATEGORIES' ? (
          <div className="pt-2">
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 mx-auto text-[#566B69] dark:text-[#8FA8A4] opacity-40 mb-3" />
                <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                  No expenses recorded yet
                </h3>
                <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] mt-1 max-w-sm mx-auto">
                  Start tracking your store's petty cash, utilities, rents, and daily operational overheads.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsRecordModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record First Expense</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBreakdown.map((cat) => (
                  <div
                    key={cat.name}
                    className="p-4 rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-[#F4F8F7]/50 dark:bg-[#142B2A]/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#123B3A] dark:text-[#F0FDFA]">
                        {cat.name}
                      </span>
                      <span className="text-xs font-bold text-[#0F766E] dark:text-[#14B8A6]">
                        {cat.percent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-[#D7E5E2] dark:bg-[#1E3B38] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0F766E] dark:bg-[#14B8A6] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, cat.percent))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#566B69] dark:text-[#8FA8A4]">
                      <span>{cat.count} records</span>
                      <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                        {formatCurrency(cat.totalAmountMinor)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ExpensesTable
            expenses={filteredExpenses}
            isLoading={isLoading}
            onDelete={handleDeleteExpense}
            deletingId={deletingId}
            onRecordFirst={() => setIsRecordModalOpen(true)}
          />
        )}
      </Card>

      {/* Record Expense Modal */}
      <RecordExpenseModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => {}}
        onSubmit={handleCreateExpense}
      />
    </div>
  );
};
