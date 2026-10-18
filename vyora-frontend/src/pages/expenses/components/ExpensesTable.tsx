import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency, formatDateReadable } from '@/utils';
import { Table, ITableOption } from '@/components/Table';
import { ExpenseRecord } from '@/types';

interface ExpensesTableProps {
  expenses: ExpenseRecord[];
  isLoading?: boolean;
  onDelete: (id: string, category: string) => void;
  deletingId?: string | null;
  onRecordFirst?: () => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  isLoading,
  onDelete,
  deletingId,
  onRecordFirst,
}) => {
  const tableOption: ITableOption<ExpenseRecord> = useMemo(
    () => ({
      module: 'expenses',
      rowKey: 'id',
      data: expenses,
      search: {
        placeholder: 'Search vendor, note, category...',
      },
      column: [
        {
          dataIndex: 'expenseDate',
          title: 'Date',
          sortable: true,
          render: (e) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4] whitespace-nowrap">
              {formatDateReadable(e.expenseDate)}
            </span>
          ),
        },
        {
          dataIndex: 'category',
          title: 'Category',
          sortable: true,
          render: (e) => (
            <span className="font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {e.category}
            </span>
          ),
        },
        {
          dataIndex: 'vendorName',
          title: 'Vendor / Payee',
          sortable: true,
          render: (e) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {e.vendorName || '—'}
            </span>
          ),
        },
        {
          dataIndex: 'notes',
          title: 'Notes',
          render: (e) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4] max-w-xs truncate block italic">
              {e.notes || '—'}
            </span>
          ),
        },
        {
          dataIndex: 'paymentMethod',
          title: 'Mode',
          sortable: true,
          align: 'center',
          render: (e) => (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#D7E5E2] dark:border-[#1E3B38] text-[#0F766E] dark:text-[#14B8A6] bg-[#0F766E]/5 dark:bg-[#0F766E]/15">
              {e.paymentMethod}
            </span>
          ),
        },
        {
          dataIndex: 'amountMinor',
          title: 'Amount',
          sortable: true,
          align: 'right',
          render: (e) => (
            <div className="text-right font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(e.amountMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'id',
          title: 'Action',
          align: 'center',
          render: (e) => (
            <button
              type="button"
              onClick={() => onDelete(e.id, e.category)}
              disabled={deletingId === e.id}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Delete expense"
              aria-label="Delete expense"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ),
        },
      ],
      emptyState: {
        title: 'No expenses recorded yet',
        description: 'Start tracking store petty cash, utility bills, logistics, and operational costs.',
        actionLabel: onRecordFirst ? 'Record First Expense' : undefined,
        onAction: onRecordFirst,
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'expenses-register.csv',
      },
    }),
    [expenses, deletingId, onDelete, onRecordFirst]
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading expense records...
      </div>
    );
  }

  return <Table<ExpenseRecord> option={tableOption} />;
};
