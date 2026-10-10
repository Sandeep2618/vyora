import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDateReadable } from '../../utils';

interface RecentInvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  amountMinor: number;
  status: string;
}

interface RecentInvoicesWidgetProps {
  invoices?: RecentInvoiceItem[];
}

export const RecentInvoicesWidget: React.FC<RecentInvoicesWidgetProps> = ({ invoices }) => {
  const getStatusVariant = (status: string) => {
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

  return (
    <Card className="lg:col-span-2 p-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2]">
        <div>
          <h3 className="text-sm font-bold text-[#123B3A]">Recent Invoices</h3>
          <p className="text-xs text-[#566B69]">Recently issued sales invoices</p>
        </div>
        <Link
          to="/invoices"
          className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[500px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold">
              <th className="py-2.5 px-3">Invoice No.</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2]">
            {invoices && invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F4F8F7]/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#0F766E]">
                    <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                  </td>
                  <td className="py-3 px-3 text-[#123B3A] font-medium">{inv.customerName}</td>
                  <td className="py-3 px-3 text-[#566B69]">{formatDateReadable(inv.date)}</td>
                  <td className="py-3 px-3 font-bold text-[#123B3A] text-right">
                    {formatCurrency(inv.amountMinor)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#566B69]">
                  No invoices recorded yet. Click "New Invoice" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
