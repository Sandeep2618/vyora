import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Printer, ArrowLeft, CreditCard, CheckCircle2, QrCode } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateReadable, minorToMajor, majorToMinor } from '@vyora/utils';
import { Invoice, PaymentMethod } from '@vyora/shared-types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { InvoicePrintTemplate } from '../components/view/InvoicePrintTemplate';
import { ThermalReceiptTemplate } from '../components/view/ThermalReceiptTemplate';
import { RecordPaymentModal } from '../components/view/modal';
import { UpiQrModal } from '@/components/ui/UpiQrModal';

export const InvoiceViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOwner, business } = useAuth();

  const [printFormat, setPrintFormat] = useState<'A4' | 'THERMAL'>('A4');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUpiQrModalOpen, setIsUpiQrModalOpen] = useState(false);
  const [payAmountMajor, setPayAmountMajor] = useState<number | string>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const { data: invoice, isLoading } = useQuery<Invoice>({
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
        amountMinor: majorToMinor(Number(payAmountMajor) || 0),
        paymentMethod: payMethod,
        referenceNumber: payRef,
        notes: payNotes,
        paymentDate: new Date().toISOString().split('T')[0],
        idempotencyKey: `rcpt-${invoice?.id}-${Date.now()}`,
      }),
    onSuccess: () => {
      toast.success('Payment Recorded', 'Receipt voucher created and ledger updated.');
      setIsPaymentModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      const msg = err.response?.data?.message || err.message || 'Failed to record payment';
      toast.error('Payment Failed', msg);
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: () => api.post(`/invoices/${id}/finalize`),
    onSuccess: () => {
      toast.success('Invoice Finalized', 'Tax invoice number assigned and ledger updated.');
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      const msg = err.response?.data?.message || err.message || 'Failed to finalize invoice';
      toast.error('Finalize Failed', msg);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-[#566B69] dark:text-slate-400">Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div className="p-8 text-center text-[#B91C1C] dark:text-rose-400">Invoice not found.</div>;
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

  const handleOpenPayment = () => {
    setPayAmountMajor(minorToMajor(invoice.dueAmountMinor));
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top action header (hidden during printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-1.5 rounded-lg text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-[#D7E5E2] dark:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#123B3A] dark:text-[#E6F4F1]">
                {invoice.invoiceNumber}
              </h2>
              <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
            </div>
            <p className="text-xs text-[#566B69] dark:text-slate-400">
              Issued on {formatDateReadable(invoice.issueDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Format selector */}
          <div className="inline-flex rounded-lg border border-[#D7E5E2] dark:border-slate-700 p-0.5 bg-[#F2F7F6] dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setPrintFormat('A4')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                printFormat === 'A4'
                  ? 'bg-white dark:bg-slate-900 text-[#123B3A] dark:text-[#E6F4F1] shadow-xs'
                  : 'text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-200'
              }`}
            >
              A4 Invoice
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('THERMAL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                printFormat === 'THERMAL'
                  ? 'bg-white dark:bg-slate-900 text-[#123B3A] dark:text-[#E6F4F1] shadow-xs'
                  : 'text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-200'
              }`}
            >
              80mm Thermal
            </button>
          </div>

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
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsUpiQrModalOpen(true)}
                  className="flex-1 sm:flex-none justify-center text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                >
                  <QrCode className="w-4 h-4 mr-1.5" />
                  UPI QR
                </Button>
                <Button
                  variant="primary"
                  onClick={handleOpenPayment}
                  className="flex-1 sm:flex-none justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  Record Payment
                </Button>
              </>
            )}

          <Button variant="outline" onClick={() => window.print()} className="flex-1 sm:flex-none justify-center">
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Printable Document Container (A4 or 80mm Thermal Receipt) */}
      {printFormat === 'THERMAL' ? (
        <ThermalReceiptTemplate invoice={invoice} />
      ) : (
        <InvoicePrintTemplate
          invoice={invoice}
          isOwner={isOwner}
          onRecordPaymentClick={handleOpenPayment}
          onFinalizeClick={() => finalizeMutation.mutate()}
          isFinalizing={finalizeMutation.isPending}
        />
      )}

      {/* Dynamic UPI QR Modal for Instant Counter Scanning */}
      <UpiQrModal
        isOpen={isUpiQrModalOpen}
        onClose={() => setIsUpiQrModalOpen(false)}
        invoiceNumber={invoice.invoiceNumber}
        amountMinor={invoice.dueAmountMinor}
        merchantName={business?.name}
        vpa={business?.upiId}
        isConfirming={paymentMutation.isPending}
        onConfirmPayment={() => {
          setIsUpiQrModalOpen(false);
          setPayAmountMajor(minorToMajor(invoice.dueAmountMinor));
          setPayMethod('UPI');
          paymentMutation.mutate();
        }}
      />

      {/* Record Payment Voucher Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoiceNumber={invoice.invoiceNumber}
        dueAmountMinor={invoice.dueAmountMinor}
        payAmountMajor={payAmountMajor}
        onPayAmountChange={setPayAmountMajor}
        payMethod={payMethod}
        onPayMethodChange={setPayMethod}
        payRef={payRef}
        onPayRefChange={setPayRef}
        payNotes={payNotes}
        onPayNotesChange={setPayNotes}
        onSubmit={() => paymentMutation.mutate()}
        isSubmitting={paymentMutation.isPending}
      />
    </div>
  );
};
