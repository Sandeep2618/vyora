import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ItemUnit, Product, TaxRatePercent } from '../../types';
import { majorToMinor, minorToMajor } from '../../utils';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const isEditing = Boolean(productToEdit);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [unit, setUnit] = useState<ItemUnit>('PCS');
  const [sellingRate, setSellingRate] = useState<number>(0);
  const [purchaseRate, setPurchaseRate] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<TaxRatePercent>(18);
  const [openingStock, setOpeningStock] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(5);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setHsnCode(productToEdit.hsnCode || '');
      setUnit(productToEdit.unit);
      setSellingRate(minorToMajor(productToEdit.sellingPriceMinor));
      setPurchaseRate(productToEdit.purchasePriceMinor ? minorToMajor(productToEdit.purchasePriceMinor) : 0);
      setTaxRate(productToEdit.taxRatePercent);
      setOpeningStock(productToEdit.openingStock || 0);
      setReorderLevel(productToEdit.reorderLevel ?? 5);
    } else {
      setName('');
      setSku('');
      setHsnCode('');
      setUnit('PCS');
      setSellingRate(0);
      setPurchaseRate(0);
      setTaxRate(18);
      setOpeningStock(0);
      setReorderLevel(5);
    }
  }, [productToEdit, isOpen]);

  const resetForm = () => {
    setName('');
    setSku('');
    setHsnCode('');
    setSellingRate(0);
    setPurchaseRate(0);
    setOpeningStock(0);
  };

  const createMutation = useCreateProduct(() => {
    resetForm();
    onClose();
  });

  const updateMutation = useUpdateProduct(() => {
    resetForm();
    onClose();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const payload = {
      name,
      sku,
      hsnCode: hsnCode || undefined,
      unit,
      sellingPriceMinor: majorToMinor(sellingRate),
      purchasePriceMinor: majorToMinor(purchaseRate),
      taxRatePercent: taxRate,
      openingStock: Number(openingStock),
      reorderLevel: Number(reorderLevel),
    };

    if (isEditing && productToEdit) {
      updateMutation.mutate({
        id: productToEdit.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product / Service' : 'Add Product / Service'}
      description={
        isEditing
          ? 'Update catalog item details, pricing, and GST tax rate'
          : 'Add a catalog item with pricing, tax rate, and opening inventory'
      }
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            isLoading={isPending}
            disabled={!name.trim() || !sku.trim()}
            className="w-full sm:w-auto"
          >
            {isEditing ? 'Update Product' : 'Save Product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Wireless Noise-Cancelling Earbuds"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="SKU Code"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            placeholder="e.g. EAR-001"
            required
          />
          <Input
            label="HSN / SAC Code"
            value={hsnCode}
            onChange={(e) => setHsnCode(e.target.value)}
            placeholder="e.g. 8517"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Measurement Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as ItemUnit)}
            required
            options={[
              { label: 'PCS (Pieces)', value: 'PCS' },
              { label: 'BOX (Boxes)', value: 'BOX' },
              { label: 'KG (Kilograms)', value: 'KG' },
              { label: 'LTR (Liters)', value: 'LTR' },
              { label: 'MTR (Meters)', value: 'MTR' },
              { label: 'SET (Sets)', value: 'SET' },
              { label: 'PKT (Packets)', value: 'PKT' },
            ]}
          />

          <Select
            label="GST Tax Rate"
            value={taxRate}
            onChange={(e) => setTaxRate(parseInt(e.target.value, 10) as TaxRatePercent)}
            required
            options={[
              { label: '0% (Exempt)', value: 0 },
              { label: '5%', value: 5 },
              { label: '12%', value: 12 },
              { label: '18% (Standard)', value: 18 },
              { label: '28%', value: 28 },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Selling Price (₹)"
            type="number"
            step="0.01"
            value={sellingRate}
            onChange={(e) => setSellingRate(parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Purchase Cost Price (₹)"
            type="number"
            step="0.01"
            value={purchaseRate}
            onChange={(e) => setPurchaseRate(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Opening Stock Quantity"
            type="number"
            value={openingStock}
            onChange={(e) => setOpeningStock(parseInt(e.target.value, 10) || 0)}
          />
          <Input
            label="Reorder Alert Threshold"
            type="number"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </form>
    </Modal>
  );
};
