import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Printer, ArrowLeft, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency, formatDateReadable, minorToMajor, majorToMinor } from '@vyora/utils';
import { Invoice, PaymentMethod } from '@vyora/shared-types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const InvoiceViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOwner } = useAuth();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payAmountMajor, setPayAmountMajor] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const { data: invoice, isLoading, error } = useQuery<Invoice>({
    queryKey: ['invoice', id],
    queryFn: () => api.get<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  });

  const paymentMutation = useMutation({
    mutationFn: () =>
      api.post('/payments', {
        type: 'RECEIPT',
        partyId: invoice?.customerId,
        invoiceId: invoice?.id,
        amountMinor: majorToMinor(payAmountMajor),
        paymentMethod: payMethod,
        referenceNumber: payRef,
        notes: payNotes,
        paymentDate: new Date().toISOString().split('T')[0],
        idempotencyKey: `rcpt-${invoice?.id}-${Date.now()}`,
      }),
    onSuccess: () => {
      setIsPaymentModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: () => api.post(`/invoices/${id}/finalize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-[#566B69]">Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-center text-[#B91C1C]">Invoice not found.</div>;
  }

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top action header (hidden during printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-1.5 rounded-lg text-[#566B69] hover:text-[#123B3A] hover:bg-white border border-[#D7E5E2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#123B3A]">
                {invoice.invoiceNumber}
              </h2>
              <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
            </div>
            <p className="text-xs text-[#566B69]">
              Issued on {formatDateReadable(invoice.issueDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isOwner && invoice.status === 'DRAFT' && (
            <Button
              isLoading={finalizeMutation.isPending}
              onClick={() => finalizeMutation.mutate()}
              className="flex-1 sm:flex-none justify-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Finalize Document
            </Button>
          )}

          {isOwner &&
            invoice.status !== 'DRAFT' &&
            invoice.status !== 'PAID' &&
            invoice.status !== 'CANCELLED' && (
              <Button
                variant="primary"
                onClick={() => {
                  setPayAmountMajor(minorToMajor(invoice.dueAmountMinor));
                  setIsPaymentModalOpen(true);
                }}
                className="flex-1 sm:flex-none justify-center"
              >
                <CreditCard className="w-4 h-4 mr-1.5" />
                Record Payment
              </Button>
            )}

          <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none justify-center">
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* A4 Printable Document Container */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 sm:p-8 lg:p-12 shadow-sm text-[#123B3A] print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 sm:pb-8 border-b-2 border-[#0F766E]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-black text-lg">
                V
              </div>
              <h1 className="text-2xl font-black text-[#123B3A] tracking-tight">
                {invoice.businessSnapshot?.name || 'Vyora Business'}
              </h1>
            </div>
            <p className="text-xs text-[#566B69] max-w-sm leading-relaxed">
              {invoice.businessSnapshot?.address}, {invoice.businessSnapshot?.city},{' '}
              {invoice.businessSnapshot?.state} - {invoice.businessSnapshot?.pincode}
            </p>
            {invoice.businessSnapshot?.gstin && (
              <p className="text-xs font-semibold text-[#123B3A] mt-1">
                GSTIN: <span className="font-mono">{invoice.businessSnapshot.gstin}</span>
              </p>
            )}
            <p className="text-xs text-[#566B69]">
              Phone: {invoice.businessSnapshot?.phone} • Email: {invoice.businessSnapshot?.email}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 bg-[#E6F4F2] text-[#0F766E] font-black text-sm tracking-wider uppercase rounded-md mb-2">
              TAX INVOICE
            </span>
            <p className="text-sm font-bold text-[#123B3A]">
              Invoice No: <span className="font-mono text-[#0F766E]">{invoice.invoiceNumber}</span>
            </p>
            <p className="text-xs text-[#566B69] mt-0.5">
              Date: {formatDateReadable(invoice.issueDate)}
            </p>
            <p className="text-xs text-[#566B69]">
              Due Date: {formatDateReadable(invoice.dueDate)}
            </p>
            <p className="text-xs text-[#566B69] mt-1">
              Place of Supply: {invoice.customerSnapshot.state}
            </p>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 py-6 border-b border-[#D7E5E2] text-xs">
          <div>
            <span className="font-bold text-[#0F766E] uppercase tracking-wider block mb-1">
              Billed To:
            </span>
            <p className="font-bold text-sm text-[#123B3A]">{invoice.customerSnapshot.name}</p>
            <p className="text-[#566B69] mt-0.5">{invoice.customerSnapshot.address}</p>
            <p className="text-[#566B69]">State: {invoice.customerSnapshot.state}</p>
            {invoice.customerSnapshot.gstin && (
              <p className="font-semibold text-[#123B3A] mt-1">
                GSTIN: <span className="font-mono">{invoice.customerSnapshot.gstin}</span>
              </p>
            )}
            <p className="text-[#566B69]">Phone: {invoice.customerSnapshot.phone}</p>
          </div>

          <div className="bg-[#F4F8F7] p-4 rounded-lg border border-[#D7E5E2]">
            <span className="font-bold text-[#123B3A] uppercase tracking-wider block mb-1">
              Payment Summary
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#566B69]">Invoice Total:</span>
                <span className="font-bold text-[#123B3A]">{formatCurrency(invoice.grandTotalMinor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#566B69]">Paid Amount:</span>
                <span className="font-bold text-[#15803D]">{formatCurrency(invoice.paidAmountMinor)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#D7E5E2]">
                <span className="font-bold text-[#123B3A]">Balance Due:</span>
                <span className="font-bold text-[#B91C1C]">{formatCurrency(invoice.dueAmountMinor)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6 overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left text-xs min-w-[650px] whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-[#123B3A] text-[#123B3A] font-bold">
                <th className="py-2.5 px-2 w-8">#</th>
                <th className="py-2.5 px-2">Description</th>
                <th className="py-2.5 px-2 w-16">HSN</th>
                <th className="py-2.5 px-2 text-center w-16">Qty</th>
                <th className="py-2.5 px-2 text-right w-20">Rate</th>
                <th className="py-2.5 px-2 text-right w-20">Taxable</th>
                <th className="py-2.5 px-2 text-center w-14">GST %</th>
                <th className="py-2.5 px-2 text-right w-20">Tax</th>
                <th className="py-2.5 px-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E5E2]">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-2 text-[#566B69]">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <p className="font-bold text-[#123B3A]">{item.productName}</p>
                    <p className="text-[10px] text-[#566B69]">SKU: {item.sku}</p>
                  </td>
                  <td className="py-3 px-2 text-[#566B69] font-mono">{item.hsnCode || '-'}</td>
                  <td className="py-3 px-2 text-center font-medium">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-2 text-right">{formatCurrency(item.unitPriceMinor)}</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(item.taxableAmountMinor)}</td>
                  <td className="py-3 px-2 text-center font-medium">{item.taxRatePercent}%</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(item.totalTaxMinor)}</td>
                  <td className="py-3 px-2 text-right font-bold text-[#123B3A]">
                    {formatCurrency(item.lineTotalMinor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals Breakdown */}
        <div className="pt-4 border-t-2 border-[#D7E5E2] flex justify-end text-xs">
          <div className="w-full sm:w-80 ml-auto space-y-2">
            <div className="flex justify-between text-[#566B69]">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#123B3A]">
                {formatCurrency(invoice.subtotalMinor)}
              </span>
            </div>
            {invoice.totalDiscountMinor > 0 && (
              <div className="flex justify-between text-[#566B69]">
                <span>Discount:</span>
                <span className="font-semibold text-[#123B3A]">
                  -{formatCurrency(invoice.totalDiscountMinor)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#566B69]">
              <span>Taxable Amount:</span>
              <span className="font-semibold text-[#123B3A]">
                {formatCurrency(invoice.totalTaxableAmountMinor)}
              </span>
            </div>

            {invoice.isInterState ? (
              <div className="flex justify-between text-[#566B69]">
                <span>IGST:</span>
                <span className="font-semibold text-[#123B3A]">
                  {formatCurrency(invoice.igstMinor)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-[#566B69]">
                  <span>CGST:</span>
                  <span className="font-semibold text-[#123B3A]">
                    {formatCurrency(invoice.cgstMinor)}
                  </span>
                </div>
                <div className="flex justify-between text-[#566B69]">
                  <span>SGST:</span>
                  <span className="font-semibold text-[#123B3A]">
                    {formatCurrency(invoice.sgstMinor)}
                  </span>
                </div>
              </>
            )}

            {invoice.roundOffMinor !== 0 && (
              <div className="flex justify-between text-[#566B69]">
                <span>Round Off:</span>
                <span className="font-semibold text-[#123B3A]">
                  {formatCurrency(invoice.roundOffMinor)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t-2 border-[#0F766E] flex justify-between text-sm font-bold text-[#123B3A]">
              <span>Grand Total:</span>
              <span className="text-base font-black text-[#0F766E]">
                {formatCurrency(invoice.grandTotalMinor)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Terms & Signatory */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#D7E5E2] grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-xs">
          <div>
            <h4 className="font-bold text-[#123B3A] mb-1">Terms & Conditions</h4>
            <p className="text-[#566B69] leading-relaxed">
              {invoice.terms ||
                '1. Goods once sold will not be taken back without original packaging.\n2. Payment is due strictly per stated invoice terms.\n3. Subject to local jurisdiction.'}
            </p>
          </div>
          <div className="text-left sm:text-right flex flex-col justify-end">
            <div className="border-b border-[#123B3A] w-48 sm:ml-auto pb-1 mb-1"></div>
            <p className="font-bold text-[#123B3A]">
              For {invoice.businessSnapshot?.name || 'Vyora Business'}
            </p>
            <p className="text-[#566B69] text-[10px]">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* Record Payment Voucher Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Receipt"
        description={`Record receipt against ${invoice.invoiceNumber}. Outstanding due: ${formatCurrency(
          invoice.dueAmountMinor,
        )}`}
      >
        <div className="space-y-4">
          <Input
            label="Payment Amount (₹)"
            type="number"
            step="0.01"
            max={minorToMajor(invoice.dueAmountMinor)}
            value={payAmountMajor}
            onChange={(e) => setPayAmountMajor(parseFloat(e.target.value) || 0)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#123B3A] mb-1">
              Payment Method <span className="text-[#B91C1C] font-bold">*</span>
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
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
            label="Reference / Transaction ID"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            placeholder="e.g. UTR12345678 / Cheque No."
          />

          <Input
            label="Notes"
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
            placeholder="Optional receipt notes"
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              isLoading={paymentMutation.isPending}
              disabled={payAmountMajor <= 0}
              onClick={() => paymentMutation.mutate()}
              className="w-full sm:w-auto"
            >
              Confirm Receipt Voucher
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
