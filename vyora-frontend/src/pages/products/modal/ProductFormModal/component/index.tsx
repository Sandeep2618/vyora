import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ItemUnit, TaxRatePercent } from '@/types';
import { majorToMinor, minorToMajor } from '@/utils';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { UNIT_OPTIONS, TAX_RATE_OPTIONS } from '@/pages/products/config';
import { ProductFormModalProps } from '../config/interface';
import { DEFAULT_TAX_RATE, DEFAULT_UNIT } from '../config/constant';

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const isEditing = Boolean(productToEdit);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [unit, setUnit] = useState<ItemUnit>(DEFAULT_UNIT as ItemUnit);
  const [sellingRate, setSellingRate] = useState<number | string>('');
  const [purchaseRate, setPurchaseRate] = useState<number | string>('');
  const [taxRate, setTaxRate] = useState<TaxRatePercent>(DEFAULT_TAX_RATE as TaxRatePercent);
  const [openingStock, setOpeningStock] = useState<number | string>('');
  const [reorderLevel, setReorderLevel] = useState<number | string>(5);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setHsnCode(productToEdit.hsnCode || '');
      setUnit(productToEdit.unit);
      setSellingRate(minorToMajor(productToEdit.sellingPriceMinor));
      setPurchaseRate(productToEdit.purchasePriceMinor ? minorToMajor(productToEdit.purchasePriceMinor) : '');
      setTaxRate(productToEdit.taxRatePercent);
      setOpeningStock(productToEdit.openingStock ?? '');
      setReorderLevel(productToEdit.reorderLevel ?? 5);
    } else {
      setName('');
      setSku('');
      setHsnCode('');
      setUnit('PCS');
      setSellingRate('');
      setPurchaseRate('');
      setTaxRate(18);
      setOpeningStock('');
      setReorderLevel(5);
    }
  }, [productToEdit, isOpen]);

  const resetForm = () => {
    setName('');
    setSku('');
    setHsnCode('');
    setSellingRate('');
    setPurchaseRate('');
    setOpeningStock('');
  };

  const createMutation = useCreateProduct(() => {
    resetForm();
    onClose();
  });

  const updateMutation = useUpdateProduct(() => {
    resetForm();
    onClose();
  });

  const isFormValid =
    Boolean(name.trim()) &&
    Boolean(sku.trim()) &&
    Number(sellingRate) > 0 &&
    (purchaseRate === '' || Number(purchaseRate) >= 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      hsnCode: hsnCode.trim() || undefined,
      unit,
      sellingPriceMinor: majorToMinor(Number(sellingRate)),
      purchasePriceMinor: purchaseRate !== '' ? majorToMinor(Number(purchaseRate)) : undefined,
      taxRatePercent: taxRate,
      openingStock: openingStock !== '' ? Number(openingStock) : undefined,
      reorderLevel: reorderLevel !== '' ? Number(reorderLevel) : undefined,
    };

    if (productToEdit) {
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
      title={isEditing ? t('form.titleEdit', { defaultValue: 'Edit Product' }) : t('form.titleAdd', { defaultValue: 'New Product' })}
      description={t('form.subtitle', { defaultValue: 'Enter product details, pricing, and initial inventory stock' })}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button
            type="submit"
            form="product-form"
            isLoading={isPending}
            disabled={!isFormValid}
            className="w-full sm:w-auto"
          >
            {t('actions.save', { ns: 'common' })}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('form.name', { defaultValue: 'Product / Service Name' })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={t('form.namePlaceholder', { defaultValue: 'e.g. Premium Cotton Shirt' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('form.sku', { defaultValue: 'SKU / Item Code' })}
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            required
            placeholder={t('form.skuPlaceholder', { defaultValue: 'e.g. SHIRT-COT-01' })}
          />

          <Input
            label={t('form.hsn', { defaultValue: 'HSN / SAC Code' })}
            value={hsnCode}
            onChange={(e) => setHsnCode(e.target.value)}
            placeholder={t('form.hsnPlaceholder', { defaultValue: 'e.g. 6205' })}
            helperText={t('form.hsnHelper', { defaultValue: '4 or 6 digit GST tariff code' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label={t('form.sellingPrice', { defaultValue: 'Selling Price (₹)' })}
            type="number"
            min="0.01"
            step="0.01"
            value={sellingRate}
            onChange={(e) => setSellingRate(e.target.value)}
            required
            placeholder="999.00"
          />

          <Input
            label={t('form.purchaseCost', { defaultValue: 'Purchase Cost (₹)' })}
            type="number"
            min="0"
            step="0.01"
            value={purchaseRate}
            onChange={(e) => setPurchaseRate(e.target.value)}
            placeholder="650.00"
          />

          <Select
            label={t('form.taxSlab', { defaultValue: 'GST Tax Slab' })}
            value={taxRate}
            onValueChange={(val) => setTaxRate(Number(val) as TaxRatePercent)}
            options={TAX_RATE_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#D7E5E2] dark:border-[#1E3B38] pt-3">
          <Select
            label={t('form.unit', { defaultValue: 'Measurement Unit' })}
            value={unit}
            onValueChange={(val) => setUnit(val as ItemUnit)}
            options={UNIT_OPTIONS}
          />

          <Input
            label={t('form.openingStock', { defaultValue: 'Opening Stock' })}
            type="number"
            min="0"
            value={openingStock}
            onChange={(e) => setOpeningStock(e.target.value)}
            disabled={isEditing}
            placeholder="0"
          />

          <Input
            label={t('form.reorderLevel', { defaultValue: 'Reorder Alert Level' })}
            type="number"
            min="0"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value)}
            placeholder="5"
            helperText={t('form.reorderHelper', { defaultValue: 'Alert when stock falls below' })}
          />
        </div>
      </form>
    </Modal>
  );
};
