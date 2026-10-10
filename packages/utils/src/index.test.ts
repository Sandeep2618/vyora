import { describe, it, expect } from 'vitest';
import {
  minorToMajor,
  majorToMinor,
  formatCurrency,
  calculateLineItem,
  calculateInvoiceTotals,
  formatDocumentNumber,
} from './index';

describe('Vyora Financial and Tax Utils', () => {
  it('converts minor and major units correctly without floating point errors', () => {
    expect(minorToMajor(4825000)).toBe(48250);
    expect(majorToMinor(48250)).toBe(4825000);
    expect(minorToMajor(99)).toBe(0.99);
    expect(majorToMinor(0.99)).toBe(99);
  });

  it('formats currency correctly in Indian locale', () => {
    const formatted = formatCurrency(4825000);
    // Should format as ₹48,250.00
    expect(formatted).toContain('48,250.00');
  });

  it('calculates intra-state GST (CGST + SGST) accurately', () => {
    // 2 units @ ₹1,500.00 (150000 minor) with 18% GST intra-state
    const line = calculateLineItem(
      {
        productId: 'prod-1',
        productName: 'Wireless Earbuds',
        sku: 'EAR-01',
        unit: 'PCS',
        quantity: 2,
        unitPriceMinor: 150000,
        taxRatePercent: 18,
      },
      false, // Intra-state
    );

    expect(line.taxableAmountMinor).toBe(300000); // 3000.00
    expect(line.cgstMinor).toBe(27000); // 9% of 3000.00 = 270.00 -> 27000 paise
    expect(line.sgstMinor).toBe(27000); // 9% of 3000.00 = 270.00 -> 27000 paise
    expect(line.igstMinor).toBe(0);
    expect(line.totalTaxMinor).toBe(54000); // 540.00
    expect(line.lineTotalMinor).toBe(354000); // 3540.00
  });

  it('calculates inter-state GST (IGST) accurately', () => {
    // 1 unit @ ₹1,000.00 with 18% GST inter-state
    const line = calculateLineItem(
      {
        productId: 'prod-1',
        productName: 'Item',
        sku: 'SKU-1',
        unit: 'PCS',
        quantity: 1,
        unitPriceMinor: 100000,
        taxRatePercent: 18,
      },
      true, // Inter-state
    );

    expect(line.taxableAmountMinor).toBe(100000);
    expect(line.cgstMinor).toBe(0);
    expect(line.sgstMinor).toBe(0);
    expect(line.igstMinor).toBe(18000); // 18% = 180.00 -> 18000 paise
    expect(line.totalTaxMinor).toBe(18000);
    expect(line.lineTotalMinor).toBe(118000);
  });

  it('calculates invoice totals with discounts and round-off', () => {
    const line1 = calculateLineItem({
      productId: 'p1',
      productName: 'Item A',
      sku: 'SKU-A',
      unit: 'PCS',
      quantity: 1,
      unitPriceMinor: 10050, // 100.50
      taxRatePercent: 18,
    });

    const totals = calculateInvoiceTotals([line1], true);
    expect(totals.totalTaxableAmountMinor).toBe(10050);
    expect(totals.cgstMinor + totals.sgstMinor).toBe(1810); // 905 + 905
    expect(totals.unroundedGrandTotalMinor).toBe(11860);
    // Rounded to nearest Rupee (100 paise) -> 11900
    expect(totals.grandTotalMinor).toBe(11900);
    expect(totals.roundOffMinor).toBe(40);
  });

  it('formats document numbers with padding', () => {
    expect(formatDocumentNumber('INV-', 48, 4)).toBe('INV-0048');
    expect(formatDocumentNumber('BILL-', 7, 3)).toBe('BILL-007');
  });
});
