export interface PurchaseLineItem {
  productId: string;
  quantity: number | string;
  unitPriceMajor: number | string;
  taxRatePercent: number;
}
