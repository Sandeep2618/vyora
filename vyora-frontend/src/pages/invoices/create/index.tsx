import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { majorToMinor, minorToMajor } from '@vyora/utils';
import { Party, Product, Invoice, BusinessProfile } from '@vyora/shared-types';
import { Button } from '@/components/ui/Button';
import { InvoiceCustomerHeader } from '../components/create/InvoiceCustomerHeader';
import { InvoiceLineItemsTable, LineFormItem } from '../components/create/InvoiceLineItemsTable';
import { InvoiceTotalsSummary, InvoicePreviewTotals } from '../components/create/InvoiceTotalsSummary';
import { NewCustomerModal } from '../components/create/modal';

export const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('invoices');

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
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

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
    mutationFn: ({ finalize }: { finalize: boolean }) => {
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
      return api.post<Invoice>(`/invoices?finalize=${finalize}`, payload);
    },
    onSuccess: (data: Invoice) => {
      navigate(`/invoices/${data.id}`);
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar with Draft & Finalize Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D7E5E2] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-1.5 rounded-lg text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 border border-[#D7E5E2] dark:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#123B3A] dark:text-slate-100">
              {t('createPage.title', { defaultValue: 'Create Invoice' })}
            </h2>
            <p className="text-xs text-[#566B69] dark:text-slate-400">
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
          />
        </div>

        <div className="space-y-6">
          <InvoiceTotalsSummary
            previewTotals={previewTotals}
            notes={notes}
            onNotesChange={setNotes}
          />
        </div>
      </div>

      {/* Add New Customer Modal */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onCustomerCreated={(newId) => setCustomerId(newId)}
      />
    </div>
  );
};
