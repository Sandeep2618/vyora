import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, CheckCircle2, XCircle, Printer } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDateReadable } from '@vyora/utils';
import { Invoice, InvoiceStatus } from '@vyora/shared-types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedInvoiceForCancel, setSelectedInvoiceForCancel] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useQuery<{ items: Invoice[]; total: number }>({
    queryKey: ['invoices', activeTab, search],
    queryFn: () => {
      let statusParam = '';
      if (activeTab === 'PAID') statusParam = 'status=PAID';
      else if (activeTab === 'PENDING') statusParam = 'status=PARTIAL';
      else if (activeTab === 'OVERDUE') statusParam = 'status=UNPAID';

      const searchParam = search ? `search=${encodeURIComponent(search)}` : '';
      const params = [statusParam, searchParam].filter(Boolean).join('&');
      return api.get<{ items: Invoice[]; total: number }>(`/invoices${params ? `?${params}` : ''}`);
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/invoices/${id}/finalize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/invoices/${id}/cancel`, { reason }),
    onSuccess: () => {
      setSelectedInvoiceForCancel(null);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#123B3A]">Invoices</h2>
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
            Manage and track all your sales invoices in one place
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/invoices/create')}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs matching design mockup */}
          <div className="flex items-center gap-2 bg-[#F4F8F7] p-1 rounded-lg border border-[#D7E5E2] w-fit">
            {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'text-[#566B69] hover:text-[#123B3A]'
                }`}
              >
                {tab.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#566B69]" />
            <input
              type="text"
              placeholder="Search invoice number, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F8F7] border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#566B69]">
                    Loading invoices...
                  </td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((inv) => (
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
                            onClick={() => finalizeMutation.mutate(inv.id)}
                            title="Finalize Invoice"
                            className="p-1.5 text-[#15803D] hover:bg-[#DCFCE7] rounded-md transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {inv.status !== 'CANCELLED' && inv.paidAmountMinor === 0 && (
                          <button
                            onClick={() => setSelectedInvoiceForCancel(inv)}
                            title="Cancel Invoice"
                            className="p-1.5 text-[#B91C1C] hover:bg-[#FEE2E2] rounded-md transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#566B69]">
                    No invoices found. Click "Create Invoice" to issue a new bill.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controlled Cancellation Modal */}
      <Modal
        isOpen={!!selectedInvoiceForCancel}
        onClose={() => setSelectedInvoiceForCancel(null)}
        title="Cancel Invoice"
        description={`Cancel invoice ${selectedInvoiceForCancel?.invoiceNumber}. This action is audited and reverses allocated stock and customer ledger balances.`}
      >
        <div className="space-y-4">
          <Input
            label="Reason for Cancellation *"
            placeholder="e.g. Order cancelled by client or wrong billing details entered"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedInvoiceForCancel(null)}
            >
              Back
            </Button>
            <Button
              variant="danger"
              disabled={!cancelReason.trim()}
              isLoading={cancelMutation.isPending}
              onClick={() => {
                if (selectedInvoiceForCancel) {
                  cancelMutation.mutate({
                    id: selectedInvoiceForCancel.id,
                    reason: cancelReason,
                  });
                }
              }}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
