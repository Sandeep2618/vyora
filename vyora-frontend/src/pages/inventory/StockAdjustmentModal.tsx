import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useProducts } from '../../hooks/useProducts';
import { useStockAdjustment } from '../../hooks/useInventory';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
}) => {
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
    { label: '-- Choose product catalog item --', value: '' },
    ...(productsData?.items.map((p) => ({
      label: `${p.name} (${p.sku}) — Available: ${p.currentStock} ${p.unit}`,
      value: p.id,
    })) || []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Stock Adjustment"
      description="Audited adjustment for physical stock reconciliation, breakage, or damage"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            form="stock-adjust-form"
            isLoading={adjustMutation.isPending}
            disabled={!selectedProductId || !deltaQty || Number(deltaQty) === 0 || !reason.trim()}
            className="w-full sm:w-auto"
          >
            Confirm Adjustment
          </Button>
        </>
      }
    >
      <form id="stock-adjust-form" onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Product"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          options={productOptions}
          required
        />

        <Input
          label="Quantity Delta (+ for Inward, - for Outward/Loss)"
          type="number"
          value={deltaQty}
          onChange={(e) => setDeltaQty(e.target.value)}
          placeholder="e.g. +10 or -2"
          required
        />

        <Input
          label="Mandatory Reason for Adjustment"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Physical inventory discrepancy or carton damaged in transit"
          required
        />
      </form>
    </Modal>
  );
};
