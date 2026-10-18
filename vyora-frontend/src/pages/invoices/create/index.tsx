import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Zap, Banknote, QrCode, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { majorToMinor, minorToMajor, formatCurrency } from '@vyora/utils';
import { Party, Product, Invoice, BusinessProfile } from '@vyora/shared-types';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { InvoiceCustomerHeader } from '../components/create/InvoiceCustomerHeader';
import { InvoiceLineItemsTable, LineFormItem } from '../components/create/InvoiceLineItemsTable';
import { InvoiceTotalsSummary, InvoicePreviewTotals } from '../components/create/InvoiceTotalsSummary';
import { NewCustomerModal } from '../components/create/modal';
import { ProductFormModal } from '@/pages/products/modal/ProductFormModal';

export const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['invoices', 'common']);

  // Queries
  const { data: customers } = useQuery<{ items: Party[] }>({
    queryKey: ['parties', 'CUSTOMER'],
    queryFn: () => api.get('/parties?type=CUSTOMER'),
  });

  const { data: products } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const { data: business } = useQuery<BusinessProfile>({
    queryKey: ['business-current'],
    queryFn: () => api.get<BusinessProfile>('/business/current'),
  });

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [posPaymentMode, setPosPaymentMode] = useState<'CASH' | 'UPI' | 'CREDIT'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Line items state
  const [lines, setLines] = useState<LineFormItem[]>([
    {
      productId: '',
      productName: '',
      sku: '',
      hsnCode: '',
      quantity: 1,
      rateMajor: 0,
      discountPercent: 0,
      taxRatePercent: 18,
    },
  ]);

  // Preview calculation from backend
  const [previewTotals, setPreviewTotals] = useState<InvoicePreviewTotals | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Auto-fill line item when product is chosen
  const handleProductSelect = (index: number, prodId: string) => {
    const selected = products?.items.find((p) => p.id === prodId);
    if (!selected) return;

    setLines((prev) => {
      const copy = [...prev];
      copy[index] = {
        productId: selected.id,
        productName: selected.name,
        sku: selected.sku,
        hsnCode: selected.hsnCode || '',
        quantity: copy[index]?.quantity || 1,
        rateMajor: minorToMajor(selected.sellingPriceMinor),
        discountPercent: copy[index]?.discountPercent || 0,
        taxRatePercent: selected.taxRatePercent,
      };
      return copy;
    });
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        sku: '',
        hsnCode: '',
        quantity: 1,
        rateMajor: 0,
        discountPercent: 0,
        taxRatePercent: 18,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, field: keyof LineFormItem, value: any) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Authoritative live preview query
  useEffect(() => {
    const validLines = lines.filter((l) => l.productId && (Number(l.quantity) || 0) > 0);
    if (!customerId || validLines.length === 0) {
      setPreviewTotals(null);
      setPreviewError(null);
      return;
    }

    const payload = {
      customerId,
      issueDate,
      dueDate,
      roundOff: true,
      items: validLines.map((l) => ({
        productId: l.productId,
        quantity: Number(l.quantity) || 1,
        unitPriceMinor: majorToMinor(Number(l.rateMajor) || 0),
        discountPercent: Number(l.discountPercent) || 0,
        taxRatePercent: l.taxRatePercent,
      })),
    };

    api
      .post<InvoicePreviewTotals>('/invoices/preview', payload)
      .then((res) => {
        setPreviewTotals(res);
        setPreviewError(null);
      })
      .catch((err) => {
        setPreviewError(err.message);
      });
  }, [customerId, lines, issueDate, dueDate]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async ({ finalize, autoPaymentMode }: { finalize: boolean; autoPaymentMode?: 'CASH' | 'UPI' }) => {
      const validLines = lines.filter((l) => l.productId && (Number(l.quantity) || 0) > 0);
      const payload = {
        customerId,
        issueDate,
        dueDate,
        notes,
        roundOff: true,
        items: validLines.map((l) => ({
          productId: l.productId,
          quantity: Number(l.quantity) || 1,
          unitPriceMinor: majorToMinor(Number(l.rateMajor) || 0),
          discountPercent: Number(l.discountPercent) || 0,
          taxRatePercent: l.taxRatePercent,
        })),
      };
      const created = await api.post<Invoice>(`/invoices?finalize=${finalize}`, payload);

      // If fast 1-tap counter sale, immediately record full payment receipt
      if (autoPaymentMode && created.grandTotalMinor > 0) {
        try {
          await api.post('/payments', {
            invoiceId: created.id,
            amountMinor: created.grandTotalMinor,
            paymentMethod: autoPaymentMode,
            paymentDate: issueDate || new Date().toISOString().split('T')[0],
            notes: `Counter 1-Tap ${autoPaymentMode} settlement`,
            idempotencyKey: `auto-rcpt-${created.id}-${Date.now()}`,
          });
        } catch (paymentErr) {
          console.warn('Instant payment receipt auto-record failed:', paymentErr);
        }
      }
      return created;
    },
    onSuccess: (data: Invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Invoice Created', 'Document saved successfully');
      navigate(`/invoices/${data.id}`);
    },
  });

  const grandTotalMinor = previewTotals?.grandTotalMinor ?? 0;
  const grandTotalMajor = grandTotalMinor / 100;
  const cashReceivedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, cashReceivedNum - grandTotalMajor);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar with Draft & Finalize Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D7E5E2] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="p-2 rounded-xl text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-[#D7E5E2] dark:border-slate-700 transition-colors cursor-pointer"
            title="Back to invoices"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#123B3A] dark:text-[#E6F4F1]">
              {t('createPage.title', { defaultValue: 'Create Invoice' })}
            </h2>
            <p className="text-xs text-[#566B69] dark:text-[#8FA8A4]">
              {t('createPage.subtitle', { defaultValue: 'Fill in the details below to issue a new bill' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate({ finalize: false })}
            disabled={!customerId || lines.every((l) => !l.productId)}
            className="flex-1 sm:flex-none justify-center"
          >
            {t('createPage.saveDraft', { defaultValue: 'Save Draft' })}
          </Button>
          <Button
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate({ finalize: true })}
            disabled={!customerId || lines.every((l) => !l.productId)}
            className="flex-1 sm:flex-none justify-center"
          >
            {t('createPage.createFinalize', { defaultValue: 'Create & Finalize' })}
          </Button>
        </div>
      </div>

      {previewError && (
        <div className="p-3 bg-[#FEE2E2] dark:bg-rose-950/30 border border-[#FECACA] dark:border-rose-900/50 rounded-xl text-xs text-[#B91C1C] dark:text-rose-400">
          {previewError}
        </div>
      )}

      {/* Main Grid: Left Details & Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InvoiceCustomerHeader
            selectedCustomerId={customerId}
            onCustomerChange={setCustomerId}
            customers={customers?.items ?? []}
            paymentTerms={paymentTerms}
            onPaymentTermsChange={setPaymentTerms}
            issueDate={issueDate}
            onIssueDateChange={setIssueDate}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            onAddNewCustomer={() => setIsNewCustomerModalOpen(true)}
          />

          <InvoiceLineItemsTable
            lines={lines}
            products={products?.items ?? []}
            onProductSelect={handleProductSelect}
            onUpdateLine={handleUpdateLine}
            onAddLine={addLine}
            onRemoveLine={removeLine}
            onAddNewProduct={() => setIsNewProductModalOpen(true)}
          />
        </div>

        <div className="space-y-6">
          <InvoiceTotalsSummary
            previewTotals={previewTotals}
            notes={notes}
            onNotesChange={setNotes}
          />

          {/* Fast Counter POS Settlement Box */}
          <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#123B3A] dark:text-[#E6F4F1]">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Fast Counter Settlement</span>
              </div>
              <span className="text-[10px] font-semibold text-[#0F766E] dark:text-[#14B8A6] uppercase tracking-wider bg-[#0F766E]/10 px-2 py-0.5 rounded-full">
                POS
              </span>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4F8F7] dark:bg-[#142B2A] rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38]">
              <button
                type="button"
                onClick={() => setPosPaymentMode('CASH')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  posPaymentMode === 'CASH'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A]'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPosPaymentMode('UPI')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  posPaymentMode === 'UPI'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A]'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setPosPaymentMode('CREDIT')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  posPaymentMode === 'CREDIT'
                    ? 'bg-[#123B3A] dark:bg-[#1E3B38] text-white shadow-2xs'
                    : 'text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Credit</span>
              </button>
            </div>

            {/* Cash Tendered & Change Return */}
            {posPaymentMode === 'CASH' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#123B3A] dark:text-[#E6F4F1]">
                  <span>Cash Received (₹):</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder={grandTotalMajor > 0 ? String(grandTotalMajor) : '0.00'}
                    className="w-28 text-right px-2.5 py-1 text-xs font-bold bg-[#F4F8F7] dark:bg-[#142B2A] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-[#123B3A] dark:text-[#F0FDFA] focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                {cashReceivedNum > grandTotalMajor && (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    <span>Return Change:</span>
                    <span>₹{changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Fast 1-Tap Action Button */}
            {posPaymentMode === 'CASH' && (
              <button
                type="button"
                disabled={createMutation.isPending || !customerId || lines.every((l) => !l.productId)}
                onClick={() => createMutation.mutate({ finalize: true, autoPaymentMode: 'CASH' })}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>1-Tap Cash Sale ({formatCurrency(grandTotalMinor)})</span>
              </button>
            )}

            {posPaymentMode === 'UPI' && (
              <button
                type="button"
                disabled={createMutation.isPending || !customerId || lines.every((l) => !l.productId)}
                onClick={() => createMutation.mutate({ finalize: true, autoPaymentMode: 'UPI' })}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>1-Tap UPI Sale ({formatCurrency(grandTotalMinor)})</span>
              </button>
            )}

            {posPaymentMode === 'CREDIT' && (
              <button
                type="button"
                disabled={createMutation.isPending || !customerId || lines.every((l) => !l.productId)}
                onClick={() => createMutation.mutate({ finalize: true })}
                className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <span>Create Invoice (Due Later)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add New Customer Modal */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onCustomerCreated={(newId) => setCustomerId(newId)}
      />

      {/* Add New Product Modal (Inline Creation Flow) */}
      <ProductFormModal
        isOpen={isNewProductModalOpen}
        onClose={() => {
          setIsNewProductModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
      />
    </div>
  );
};
