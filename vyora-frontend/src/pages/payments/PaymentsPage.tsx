import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDateReadable, majorToMinor } from '@vyora/utils';
import { Party, PaymentRecord, PaymentMethod, PaymentType } from '@vyora/shared-types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#123B3A]">Payments & Receipts</h2>
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
            Record customer receipts, supplier settlements, and reconcile outstanding dues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Record Payment / Receipt</span>
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
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
              ) : paymentsData?.items && paymentsData.items.length > 0 ? (
                paymentsData.items.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F4F8F7]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F766E]">
                      {p.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.type === 'RECEIPT' ? (
                        <span className="inline-flex items-center gap-1 text-[#15803D] font-bold text-[11px]">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Receipt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#A16207] font-bold text-[11px]">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Payment
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#123B3A]">{p.partyName}</td>
                    <td className="py-3.5 px-4 text-[#566B69]">{formatDateReadable(p.paymentDate)}</td>
                    <td className="py-3.5 px-4 text-[#566B69] font-medium">{p.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-[#566B69] font-mono">{p.referenceNumber || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-black text-[#123B3A]">
                      <span className={p.type === 'RECEIPT' ? 'text-[#15803D]' : 'text-[#123B3A]'}>
                        {formatCurrency(p.amountMinor)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#566B69]">
                    No payments recorded yet. Click "Record Payment / Receipt" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

          <div>
            <label className="block text-xs font-semibold text-[#123B3A] mb-1">
              Select {type === 'RECEIPT' ? 'Customer' : 'Supplier'} *
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
            >
              <option value="">-- Choose Party --</option>
              {parties?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone}) — Balance: {formatCurrency(Math.abs(p.currentBalanceMinor))}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Payment Amount (₹) *"
            type="number"
            step="0.01"
            value={amountMajor}
            onChange={(e) => setAmountMajor(parseFloat(e.target.value) || 0)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#123B3A] mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Payment Date *"
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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!partyId || amountMajor <= 0}
              onClick={() => createMutation.mutate()}
            >
              Confirm Voucher
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
