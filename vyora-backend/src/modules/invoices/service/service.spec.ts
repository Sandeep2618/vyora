import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoicesService } from './index';
import { InvoiceModel } from '../model';
import { PartyModel } from '../../parties/model';
import { ProductModel } from '../../products/model';
import { BusinessService } from '../../business/service';
import { InventoryService } from '../../inventory/service';
import { PartiesService } from '../../parties/service';
import { AuditService } from '../../audit/service';
import { BadRequestError } from '../../../util';

describe('InvoicesService - Core Invariants', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(BusinessService, 'getBusinessById').mockResolvedValue({
      id: 'biz-1',
      name: 'Vyora Tech',
      state: 'Maharashtra',
      invoicePrefix: 'INV-',
      invoiceNumberPadding: 4,
    } as any);

    vi.spyOn(BusinessService, 'acquireNextInvoiceNumber').mockResolvedValue(48);
    vi.spyOn(InventoryService, 'recordMovement').mockResolvedValue({} as any);
    vi.spyOn(PartiesService, 'updateBalance').mockResolvedValue({} as any);
    vi.spyOn(AuditService, 'logAction').mockResolvedValue(undefined);
  });

  it('blocks invoice finalization if stock is insufficient', async () => {
    vi.spyOn(PartyModel, 'findOne').mockResolvedValue({
      _id: 'cust-1',
      name: 'Rohan Traders',
      billingAddress: { state: 'Maharashtra', line1: 'Street 1', city: 'Mumbai' },
    } as any);

    vi.spyOn(ProductModel, 'find').mockResolvedValue([
      {
        _id: 'prod-1',
        name: 'Wireless Earbuds',
        sku: 'EAR-01',
        unit: 'PCS',
        sellingPriceMinor: 150000,
        taxRatePercent: 18,
        currentStock: 2, // only 2 in stock
      },
    ] as any);

    vi.spyOn(ProductModel, 'findOne').mockResolvedValue({
      _id: 'prod-1',
      name: 'Wireless Earbuds',
      sku: 'EAR-01',
      unit: 'PCS',
      currentStock: 2, // only 2 in stock
    } as any);

    // Requesting 5 units when only 2 are available
    await expect(
      InvoicesService.create(
        'biz-1',
        {
          customerId: 'cust-1',
          issueDate: '2025-04-23',
          dueDate: '2025-05-08',
          items: [
            {
              productId: 'prod-1',
              quantity: 5,
              unitPriceMinor: 150000,
              discountPercent: 0,
              taxRatePercent: 18,
            },
          ],
        },
        'user-1',
        true, // finalize immediately
      ),
    ).rejects.toThrow(BadRequestError);
  });

  it('atomically reduces inventory and commits customer receivable on finalization', async () => {
    vi.spyOn(PartyModel, 'findOne').mockResolvedValue({
      _id: 'cust-1',
      name: 'Rohan Traders',
      billingAddress: { state: 'Maharashtra', line1: 'Street 1', city: 'Mumbai' },
    } as any);

    vi.spyOn(ProductModel, 'find').mockResolvedValue([
      {
        _id: 'prod-1',
        name: 'Wireless Earbuds',
        sku: 'EAR-01',
        unit: 'PCS',
        sellingPriceMinor: 150000,
        taxRatePercent: 18,
        currentStock: 10,
      },
    ] as any);

    vi.spyOn(ProductModel, 'findOne').mockResolvedValue({
      _id: 'prod-1',
      name: 'Wireless Earbuds',
      sku: 'EAR-01',
      unit: 'PCS',
      currentStock: 10,
    } as any);

    vi.spyOn(InvoiceModel.prototype, 'save').mockResolvedValue({} as any);

    const result = await InvoicesService.create(
      'biz-1',
      {
        customerId: 'cust-1',
        issueDate: '2025-04-23',
        dueDate: '2025-05-08',
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            unitPriceMinor: 150000,
            discountPercent: 0,
            taxRatePercent: 18,
          },
        ],
      },
      'user-1',
      true, // finalize immediately
    );

    expect(result.invoiceNumber).toBe('INV-0048');
    expect(result.status).toBe('UNPAID');
    expect(InventoryService.recordMovement).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'biz-1',
        productId: 'prod-1',
        quantityDelta: -2,
        movementType: 'SALE',
      }),
    );
    expect(PartiesService.updateBalance).toHaveBeenCalledWith('biz-1', 'cust-1', result.grandTotalMinor);
    expect(AuditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'FINALIZED',
      }),
    );
  });
});
