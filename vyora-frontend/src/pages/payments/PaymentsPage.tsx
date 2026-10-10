import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard, ArrowDownLeft, ArrowUpRight, Filter, X } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDateReadable, majorToMinor } from '@vyora/utils';
import { Party, PaymentRecord, PaymentMethod, PaymentType } from '@vyora/shared-types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RECEIPT' | 'PAYMENT'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [type, setType] = useState<PaymentType>('RECEIPT');
  const [partyId, setPartyId] = useState('');
  const [amountMajor, setAmountMajor] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const { data: parties } = useQuery<{ items: Party[] }>({
    queryKey: ['parties', type === 'RECEIPT' ? 'CUSTOMER' : 'SUPPLIER'],
    queryFn: () => api.get(`/parties?type=${type === 'RECEIPT' ? 'CUSTOMER' : 'SUPPLIER'}`),
  });

  const { data: paymentsData, isLoading } = useQuery<{ items: PaymentRecord[]; total: number }>({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/payments', {
        type,
        partyId,
        amountMinor: majorToMinor(amountMajor),
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        paymentDate,
        notes: notes || undefined,
        idempotencyKey: `pay-${partyId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setPartyId('');
      setAmountMajor(0);
      setReferenceNumber('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  // Client-side filtering
  const filteredPayments = useMemo(() => {
    if (!paymentsData?.items) return [];

    return paymentsData.items.filter((p) => {
      // Type
      let matchesType = true;
      if (typeFilter !== 'ALL') {
        matchesType = p.type === typeFilter;
      }

      // Method
      const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;

      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.paymentNumber.toLowerCase().includes(q) ||
        p.partyName.toLowerCase().includes(q) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q));

      return matchesType && matchesMethod && matchesSearch;
    });
  }, [paymentsData?.items, typeFilter, methodFilter, search]);

  const hasActiveFilters = typeFilter !== 'ALL' || methodFilter !== 'ALL' || search !== '';

  const clearAllFilters = () => {
    setTypeFilter('ALL');
    setMethodFilter('ALL');
    setSearch('');
  };

  const partyOptions = [
    { label: '-- Choose Party --', value: '' },
    ...(parties?.items.map((p) => ({
      label: `${p.name} (${p.phone}) — Balance: ${formatCurrency(Math.abs(p.currentBalanceMinor))}`,
      value: p.id,
    })) || []),
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Payments & Receipts"
        description="Record customer receipts, supplier settlements, and reconcile outstanding dues"
      >
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>Record Voucher</span>
        </Button>
      </PageHeader>

      {/* Payments Table Card */}
      <Card className="p-3.5 sm:p-5 space-y-4">
        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showFilters || typeFilter !== 'ALL' || methodFilter !== 'ALL'
                  ? 'bg-[#E6F4F2] border-[#0F766E] text-[#0F766E]'
                  : 'bg-[#F4F8F7] border-[#D7E5E2] text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(typeFilter !== 'ALL' || methodFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <div className="text-xs text-[#566B69] font-medium hidden sm:block">
              Showing <span className="font-bold text-[#123B3A]">{filteredPayments.length}</span> records
            </div>
          </div>

          <div className="w-full lg:w-72 shrink-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search voucher, party, UTR..."
              className="w-full"
            />
          </div>
        </div>

        {/* Filter Toolbar Drawer */}
        {showFilters && (
          <div className="p-3.5 bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
            <div>
              <label className="block text-[11px] font-semibold text-[#123B3A] mb-1">
                Voucher Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="ALL">All Types</option>
                <option value="RECEIPT">Receipts (From Customers)</option>
                <option value="PAYMENT">Payments (To Suppliers)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#123B3A] mb-1">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="ALL">All Methods</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-xs min-w-[700px] whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                <th className="py-3 px-4">Voucher No.</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference / UTR</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E5E2]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#566B69]">
                    Loading payment records...
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F4F8F7]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F766E]">
                      {p.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.type === 'RECEIPT' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                          <ArrowDownLeft className="w-3 h-3" /> Receipt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                          <ArrowUpRight className="w-3 h-3" /> Payment
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#123B3A]">{p.partyName}</td>
                    <td className="py-3.5 px-4 text-[#566B69]">
                      {formatDateReadable(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4 text-[#566B69] font-medium">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#566B69]">
                      {p.referenceNumber || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#123B3A]">
                      {formatCurrency(p.amountMinor)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6">
                    <EmptyState
                      icon={CreditCard}
                      title={hasActiveFilters ? 'No payments match filters' : 'No payment vouchers recorded'}
                      description={
                        hasActiveFilters
                          ? 'No payment records match your active search or filters. Reset filters to see all.'
                          : 'Record receipts from customers or payments to vendors to manage cash flow traceably.'
                      }
                      actionLabel={hasActiveFilters ? 'Reset Filters' : 'Record Voucher'}
                      onAction={hasActiveFilters ? clearAllFilters : () => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Voucher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Payment / Receipt Voucher"
        description="Idempotent ledger voucher with customer/supplier balance adjustment"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-[#F4F8F7] p-1 rounded-lg border border-[#D7E5E2]">
            <button
              type="button"
              onClick={() => {
                setType('RECEIPT');
                setPartyId('');
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${
                type === 'RECEIPT'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              Receipt (From Customer)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('PAYMENT');
                setPartyId('');
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${
                type === 'PAYMENT'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              Payment (To Supplier)
            </button>
          </div>

          <Select
            label={`Select ${type === 'RECEIPT' ? 'Customer' : 'Supplier'}`}
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            options={partyOptions}
            required
          />

          <Input
            label="Payment Amount (₹)"
            type="number"
            step="0.01"
            value={amountMajor}
            onChange={(e) => setAmountMajor(parseFloat(e.target.value) || 0)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              required
              options={[
                { label: 'Bank Transfer (NEFT/RTGS/IMPS)', value: 'BANK_TRANSFER' },
                { label: 'UPI', value: 'UPI' },
                { label: 'Cash', value: 'CASH' },
                { label: 'Cheque', value: 'CHEQUE' },
                { label: 'Debit / Credit Card', value: 'CARD' },
                { label: 'Other', value: 'OTHER' },
              ]}
            />

            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Reference / UTR / Cheque No."
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="e.g. UTR-98214812"
          />

          <Input
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Advance payment against order"
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!partyId || amountMajor <= 0}
              onClick={() => createMutation.mutate()}
              className="w-full sm:w-auto"
            >
              Confirm Voucher
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
