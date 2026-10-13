export interface InvoicePreviewTotals {
  subtotalMinor: number;
  totalDiscountMinor: number;
  totalTaxMinor: number;
  roundOffMinor: number;
  grandTotalMinor: number;
  isInterState: boolean;
}

export interface InvoiceTotalsSummaryProps {
  previewTotals: InvoicePreviewTotals | null;
  notes: string;
  onNotesChange: (value: string) => void;
}
