import React from 'react';
import { Party, Product, TaxRatePercent } from '@vyora/shared-types';

export interface PurchaseLineItem {
  productId: string;
  quantity: number | string;
  unitPriceMajor: number | string;
  taxRatePercent: TaxRatePercent;
}

export interface RecordPurchaseBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
  onSupplierIdChange: (id: string) => void;
  suppliers: Party[];
  billNumber: string;
  onBillNumberChange: (num: string) => void;
  billDate: string;
  onBillDateChange: (date: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  lines: PurchaseLineItem[];
  onLinesChange: React.Dispatch<React.SetStateAction<PurchaseLineItem[]>>;
  products: Product[];
  onSubmit: () => void;
  isSubmitting: boolean;
}
