import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateReadable } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import { Table, ITableOption, ITableEvent, TABLE_EVENT } from '@/components/Table';
import { Invoice } from '@/types';
import { InvoiceTableProps } from '../config/interface';
import { getStatusVariant } from '../util';

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  hasActiveFilters,
  isOwner = true,
  onResetFilters,
  onFinalize,
  onCancelClick,
  onCreateClick,
}) => {
  const { t } = useTranslation(['invoices', 'common']);

  const tableOption: ITableOption<Invoice> = useMemo(
    () => ({
      module: 'invoices',
      rowKey: 'id',
      data: invoices,
      search: false,
      isFiltered: hasActiveFilters,
      column: [
        {
          dataIndex: 'invoiceNumber',
          title: t('columns.invoiceNo'),
          sortable: true,
          render: (inv) => (
            <Link
              to={`/invoices/${inv.id}`}
              className="font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline"
            >
              {inv.invoiceNumber}
            </Link>
          ),
        },
        {
          dataIndex: 'customerSnapshot.name',
          title: t('columns.customer'),
          sortable: true,
          render: (inv) => (
            <div className="font-medium text-[#123B3A] dark:text-[#F0FDFA]">
              <span>{inv.customerSnapshot?.name || '—'}</span>
              {inv.customerSnapshot?.phone && (
                <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4]">
                  {inv.customerSnapshot.phone}
                </p>
              )}
            </div>
          ),
        },
        {
          dataIndex: 'issueDate',
          title: t('columns.date'),
          sortable: true,
          render: (inv) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {formatDateReadable(inv.issueDate)}
            </span>
          ),
        },
        {
          dataIndex: 'dueDate',
          title: t('columns.dueDate'),
          sortable: true,
          render: (inv) => (
            <span className="text-[#566B69] dark:text-[#8FA8A4]">
              {formatDateReadable(inv.dueDate)}
            </span>
          ),
        },
        {
          dataIndex: 'grandTotalMinor',
          title: t('columns.amount'),
          sortable: true,
          align: 'right',
          render: (inv) => (
            <div className="text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {formatCurrency(inv.grandTotalMinor)}
            </div>
          ),
        },
        {
          dataIndex: 'status',
          title: t('columns.status'),
          sortable: true,
          align: 'center',
          render: (inv) => (
            <Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge>
          ),
        },
        {
          dataIndex: 'action',
          title: t('columns.actions'),
          align: 'right',
          render: (inv) => (
            <div className="flex items-center justify-end gap-1" data-prevent-row-click="true">
              <Link
                to={`/invoices/${inv.id}`}
                className="p-1.5 text-[#566B69] dark:text-[#8FA8A4] hover:text-[#0F766E] dark:hover:text-[#14B8A6] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] rounded-lg transition-colors cursor-pointer"
                title="View Details"
                aria-label="View Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </Link>
              {isOwner && inv.status === 'DRAFT' && (
                <button
                  type="button"
                  onClick={() => onFinalize(inv.id)}
                  className="p-1.5 text-[#0F766E] dark:text-[#14B8A6] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] rounded-lg transition-colors cursor-pointer"
                  title="Finalize Invoice"
                  aria-label="Finalize Invoice"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
              {isOwner && inv.status !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => onCancelClick(inv)}
                  className="p-1.5 text-[#566B69] dark:text-[#8FA8A4] hover:text-[#B91C1C] dark:hover:text-rose-400 hover:bg-[#FEE2E2] dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Cancel Invoice"
                  aria-label="Cancel Invoice"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ),
        },
      ],
      emptyState: {
        title: t('empty.title'),
        description: t('empty.description'),
        actionLabel: isOwner ? t('actions.newInvoice', { ns: 'common' }) : undefined,
        onAction: onCreateClick,
      },
      filteredEmptyState: {
        title: 'No invoices match filters',
        description:
          'No invoice records match your active search, status, or date range filters. Reset filters to see all.',
        actionLabel: t('actions.reset', { ns: 'common' }),
        onAction: onResetFilters,
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
      },
      export: {
        filename: 'invoices-register.csv',
      },
    }),
    [t, isOwner, onCancelClick, onCreateClick, onFinalize, onResetFilters, invoices, hasActiveFilters]
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        {t('status.loading', { ns: 'common' })}
      </div>
    );
  }

  return <Table<Invoice> option={tableOption} />;
};
