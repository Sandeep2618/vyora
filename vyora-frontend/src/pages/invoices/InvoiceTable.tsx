import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency, formatDateReadable } from '../../utils';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onFinalize: (id: string) => void;
  onCancelClick: (invoice: Invoice) => void;
  onCreateClick: () => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  hasActiveFilters,
  onResetFilters,
  onFinalize,
  onCancelClick,
  onCreateClick,
}) => {
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
        actionLabel={hasActiveFilters ? 'Reset Filters' : 'Create Invoice'}
        onAction={hasActiveFilters ? onResetFilters : onCreateClick}
      />
    );
  }

  return (
    <div className="overflow-x-auto -mx-1 sm:mx-0">
      <table className="w-full text-left text-xs min-w-[640px] whitespace-nowrap">
        <thead>
          <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
            <th className="py-3 px-4">Invoice No.</th>
            <th className="py-3 px-4">Customer</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4 text-right">Amount</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D7E5E2]">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-[#F4F8F7]/60 transition-colors">
              <td className="py-3.5 px-4 font-bold text-[#0F766E]">
                <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
              </td>
              <td className="py-3.5 px-4 font-medium text-[#123B3A]">
                {inv.customerSnapshot.name}
              </td>
              <td className="py-3.5 px-4 text-[#566B69]">
                {formatDateReadable(inv.issueDate)}
              </td>
              <td className="py-3.5 px-4 font-bold text-[#123B3A] text-right">
                {formatCurrency(inv.grandTotalMinor)}
              </td>
              <td className="py-3.5 px-4 text-center">
                <Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge>
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/invoices/${inv.id}`}
                    title="View / Print Invoice"
                    className="p-1.5 text-[#566B69] hover:text-[#0F766E] hover:bg-[#E6F4F2] rounded-md transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  {inv.status === 'DRAFT' && (
                    <button
                      onClick={() => onFinalize(inv.id)}
                      title="Finalize Invoice"
                      className="p-1.5 text-[#15803D] hover:bg-[#DCFCE7] rounded-md transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {inv.status !== 'CANCELLED' && inv.paidAmountMinor === 0 && (
                    <button
                      onClick={() => onCancelClick(inv)}
                      title="Cancel Invoice"
                      className="p-1.5 text-[#B91C1C] hover:bg-[#FEE2E2] rounded-md transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
