import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDateReadable } from '@/utils';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { InvoiceTableProps } from '../config/interface';
import { getStatusVariant } from '../util';
import { useInvoiceTable } from '../hook';

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
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedInvoices,
  } = useInvoiceTable({
    invoices,
    hasActiveFilters,
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        {t('status.loading', { ns: 'common' })}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        title={hasActiveFilters ? 'No invoices match filters' : t('empty.title')}
        description={
          hasActiveFilters
            ? 'No invoice records match your active search, status, or date range filters. Reset filters to see all.'
            : t('empty.description')
        }
        actionLabel={
          hasActiveFilters
            ? t('actions.reset', { ns: 'common' })
            : isOwner
              ? t('actions.newInvoice', { ns: 'common' })
              : undefined
        }
        onAction={hasActiveFilters ? onResetFilters : isOwner ? onCreateClick : undefined}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] overflow-hidden shadow-2xs">
        <Table className="min-w-[720px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.invoiceNo')}</TableHead>
              <TableHead>{t('columns.customer')}</TableHead>
              <TableHead>{t('columns.date')}</TableHead>
              <TableHead>{t('columns.dueDate')}</TableHead>
              <TableHead className="text-right">{t('columns.amount')}</TableHead>
              <TableHead className="text-center">{t('columns.status')}</TableHead>
              <TableHead className="text-right">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-semibold text-[#0F766E] dark:text-[#14B8A6]">
                  <Link to={`/invoices/${invoice.id}`} className="hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell className="font-medium text-[#123B3A] dark:text-[#F0FDFA]">
                  {invoice.customerSnapshot.name}
                  {invoice.customerSnapshot.phone && (
                    <p className="text-[10px] text-[#566B69] dark:text-[#8FA8A4]">
                      {invoice.customerSnapshot.phone}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-[#566B69] dark:text-[#8FA8A4]">
                  {formatDateReadable(invoice.issueDate)}
                </TableCell>
                <TableCell className="text-[#566B69] dark:text-[#8FA8A4]">
                  {formatDateReadable(invoice.dueDate)}
                </TableCell>
                <TableCell className="text-right font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                  {formatCurrency(invoice.grandTotalMinor)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="p-1.5 text-[#566B69] dark:text-[#8FA8A4] hover:text-[#0F766E] dark:hover:text-[#14B8A6] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    {isOwner && invoice.status === 'DRAFT' && (
                      <button
                        onClick={() => onFinalize(invoice.id)}
                        className="p-1.5 text-[#0F766E] dark:text-[#14B8A6] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] rounded-lg transition-colors cursor-pointer"
                        title="Finalize Invoice"
                        aria-label="Finalize Invoice"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isOwner && invoice.status !== 'CANCELLED' && (
                      <button
                        onClick={() => onCancelClick(invoice)}
                        className="p-1.5 text-[#566B69] dark:text-[#8FA8A4] hover:text-[#B91C1C] dark:hover:text-rose-400 hover:bg-[#FEE2E2] dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Cancel Invoice"
                        aria-label="Cancel Invoice"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={invoices.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setPageSize}
      />
    </div>
  );
};
