import { Product } from '@/types';

export interface LineFormItem {
  productId: string;
  productName: string;
  sku: string;
  hsnCode?: string;
  quantity: number | string;
  rateMajor: number | string;
  discountPercent: number;
  taxRatePercent: any;
}

export interface InvoiceLineItemsTableProps {
  lines: LineFormItem[];
  products: Product[];
  onProductSelect: (index: number, productId: string) => void;
  onUpdateLine: (index: number, field: keyof LineFormItem, value: any) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
}
