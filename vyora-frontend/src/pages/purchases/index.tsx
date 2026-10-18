import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingCart } from 'lucide-react';
import { api } from '../../lib/api';
import { majorToMinor } from '@vyora/utils';
import { Party, Product, PurchaseBill } from '@vyora/shared-types';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { RecordPurchaseBillModal, PurchaseLineItem } from './modal';
import { PurchasesTable } from './components/PurchasesTable';

export const PurchasesPage: React.FC = () => {
  const { t } = useTranslation(['purchases', 'common']);
  const { isOwner } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [lines, setLines] = useState<PurchaseLineItem[]>([
    { productId: '', quantity: 1, unitPriceMajor: '', taxRatePercent: 18 },
  ]);

  const { data: suppliers } = useQuery<{ items: Party[] }>({
    queryKey: ['parties', 'SUPPLIER'],
    queryFn: () => api.get('/parties?type=SUPPLIER'),
  });

  const { data: products } = useQuery<{ items: Product[] }>({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const { data: bills, isLoading } = useQuery<{ items: PurchaseBill[]; total: number }>({
    queryKey: ['purchases'],
    queryFn: () => api.get('/purchases'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/purchases', {
        supplierId,
        billNumber,
        billDate,
        notes,
        items: lines
          .filter((l) => l.productId && (Number(l.quantity) || 0) > 0)
          .map((l) => ({
            productId: l.productId,
            quantity: Number(l.quantity) || 1,
            unitPriceMinor: majorToMinor(Number(l.unitPriceMajor) || 0),
            taxRatePercent: l.taxRatePercent,
          })),
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setSupplierId('');
      setBillNumber('');
      setLines([{ productId: '', quantity: 1, unitPriceMajor: '', taxRatePercent: 18 }]);
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Purchase Bill Recorded', 'Inventory increased and supplier ledger updated.');
    },
    onError: (err: any) => {
      toast.error('Failed to Record Bill', err?.response?.data?.message || err?.message || 'Could not record purchase bill.');
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      >
        {isOwner && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>{t('button.recordBill')}</span>
          </Button>
        )}
      </PageHeader>

      {/* Purchases Content */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
          {t('common.loading', { defaultValue: 'Loading purchase bills...' })}
        </div>
      ) : bills?.items && bills.items.length > 0 ? (
        <PurchasesTable bills={bills.items} />
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title={t('empty.title')}
          description={t('empty.description')}
          actionLabel={isOwner ? t('empty.action') : undefined}
          onAction={isOwner ? () => setIsModalOpen(true) : undefined}
        />
      )}

      {/* Record Purchase Bill Modal */}
      <RecordPurchaseBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplierId={supplierId}
        onSupplierIdChange={setSupplierId}
        suppliers={suppliers?.items ?? []}
        billNumber={billNumber}
        onBillNumberChange={setBillNumber}
        billDate={billDate}
        onBillDateChange={setBillDate}
        notes={notes}
        onNotesChange={setNotes}
        lines={lines}
        onLinesChange={setLines}
        products={products?.items ?? []}
        onSubmit={() => createMutation.mutate()}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
};
