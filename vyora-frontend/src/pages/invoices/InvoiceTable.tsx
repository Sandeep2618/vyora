import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency, formatDateReadable } from '../../utils';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
  isOwner?: boolean;
  onResetFilters?: () => void;
  onFinalize: (id: string) => void;
  onCancelClick: (invoice: Invoice) => void;
  onCreateClick: () => void;
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [invoices.length, hasActiveFilters]);

  const getStatusVariant = (status: InvoiceStatus) => {
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

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#566B69]">
        <div className="w-6 h-6 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading invoices...
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        title={hasActiveFilters ? 'No invoices match filters' : 'No invoices found'}
        description={
          hasActiveFilters
            ? 'No invoices match your selected status, timeframe, or search criteria. Reset filters to see all.'
            : 'Issue your first sales invoice to track receivables, GST tax slabs, and payment collections.'
        }
        actionLabel={hasActiveFilters ? 'Reset Filters' : isOwner ? 'Create Invoice' : undefined}
        onAction={hasActiveFilters ? onResetFilters : isOwner ? onCreateClick : undefined}
      />
    );
  }

  const paginatedInvoices = invoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#D7E5E2] bg-white overflow-hidden shadow-sm">
        <Table className="min-w-[640px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-bold text-[#0F766E]">
                  <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                </TableCell>
                <TableCell className="font-medium text-[#123B3A]">
                  {inv.customerSnapshot.name}
                </TableCell>
                <TableCell className="text-[#566B69]">
                  {formatDateReadable(inv.issueDate)}
                </TableCell>
                <TableCell className="font-bold text-[#123B3A] text-right">
                  {formatCurrency(inv.grandTotalMinor)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/invoices/${inv.id}`}
                      title="View / Print Invoice"
                      className="p-1.5 text-[#566B69] hover:text-[#0F766E] hover:bg-[#E6F4F2] rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {isOwner && inv.status === 'DRAFT' && (
                      <button
                        onClick={() => onFinalize(inv.id)}
                        title="Finalize Invoice"
                        className="p-1.5 text-[#15803D] hover:bg-[#DCFCE7] rounded-md transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {isOwner && inv.status !== 'CANCELLED' && inv.paidAmountMinor === 0 && (
                      <button
                        onClick={() => onCancelClick(inv)}
                        title="Cancel Invoice"
                        className="p-1.5 text-[#B91C1C] hover:bg-[#FEE2E2] rounded-md transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
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
        onItemsPerPageChange={(limit) => {
          setPageSize(limit);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
};
