import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { useStockAdjustment } from '@/hooks/useInventory';
import { StockAdjustmentModalProps } from '../config/interface';

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(['inventory', 'common']);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [deltaQty, setDeltaQty] = useState<number | string>('');
  const [reason, setReason] = useState('');

  const { data: productsData } = useProducts();

  const resetForm = () => {
    setSelectedProductId('');
    setDeltaQty('');
    setReason('');
  };

  const adjustMutation = useStockAdjustment(() => {
    resetForm();
    onClose();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !deltaQty || Number(deltaQty) === 0 || !reason.trim()) return;

    adjustMutation.mutate({
      productId: selectedProductId,
      quantityDelta: Number(deltaQty),
      reason,
    });
  };

  const productOptions = [
    { label: t('adjustmentModal.choosePlaceholder', { defaultValue: '-- Choose product catalog item --' }), value: '' },
    ...(productsData?.items.map((p) => ({
      label: `${p.name} (${p.sku}) — ${t('adjustmentModal.available', { defaultValue: 'Available' })}: ${p.currentStock} ${p.unit}`,
      value: p.id,
    })) || []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('adjustmentModal.title', { defaultValue: 'Manual Stock Adjustment' })}
      description={t('adjustmentModal.description', { defaultValue: 'Audited adjustment for physical stock reconciliation, breakage, or damage' })}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button
            type="submit"
            form="stock-adjust-form"
            isLoading={adjustMutation.isPending}
            disabled={!selectedProductId || !deltaQty || Number(deltaQty) === 0 || !reason.trim()}
            className="w-full sm:w-auto"
          >
            {t('actions.confirm', { ns: 'common' })}
          </Button>
        </>
      }
    >
      <form id="stock-adjust-form" onSubmit={handleSubmit} className="space-y-4">
        <Select
          label={t('adjustmentModal.selectProduct', { defaultValue: 'Select Product' })}
          value={selectedProductId}
          onValueChange={(val) => setSelectedProductId(val)}
          options={productOptions}
          required
        />

        <Input
          label={t('adjustmentModal.deltaQty', { defaultValue: 'Quantity Delta (+ for Inward, - for Outward/Loss)' })}
          type="number"
          value={deltaQty}
          onChange={(e) => setDeltaQty(e.target.value)}
          placeholder={t('adjustmentModal.deltaPlaceholder', { defaultValue: 'e.g. +10 or -2' })}
          required
        />

        <Input
          label={t('adjustmentModal.reason', { defaultValue: 'Mandatory Reason for Adjustment' })}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('adjustmentModal.reasonPlaceholder', { defaultValue: 'e.g. Physical inventory discrepancy or carton damaged in transit' })}
          required
        />
      </form>
    </Modal>
  );
};
