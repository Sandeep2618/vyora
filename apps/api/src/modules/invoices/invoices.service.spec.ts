import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoicesService } from './invoices.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InvoicesService - Core Invariants', () => {
  let service: InvoicesService;
  let mockInvoiceModel: any;
  let mockPartyModel: any;
  let mockProductModel: any;
  let mockBusinessService: any;
  let mockInventoryService: any;
  let mockPartiesService: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockInvoiceModel = vi.fn().mockImplementation((data) => ({
      ...data,
      _id: 'inv-123',
      save: vi.fn().mockResolvedValue(true),
    }));
    mockInvoiceModel.findOne = vi.fn();
    mockInvoiceModel.find = vi.fn();
    mockInvoiceModel.countDocuments = vi.fn();

    mockPartyModel = {
      findOne: vi.fn(),
    };

    mockProductModel = {
      find: vi.fn(),
      findOne: vi.fn(),
    };

    mockBusinessService = {
      getBusinessById: vi.fn().mockResolvedValue({
        id: 'biz-1',
        name: 'Vyora Tech',
        state: 'Maharashtra',
        invoicePrefix: 'INV-',
        invoiceNumberPadding: 4,
      }),
      acquireNextInvoiceNumber: vi.fn().mockResolvedValue(48),
    };

    mockInventoryService = {
      recordMovement: vi.fn().mockResolvedValue(true),
    };

    mockPartiesService = {
      updateBalance: vi.fn().mockResolvedValue(true),
    };

    mockAuditService = {
      logAction: vi.fn().mockResolvedValue(true),
    };

    service = new InvoicesService(
      mockInvoiceModel,
      mockPartyModel,
      mockProductModel,
      mockBusinessService,
      mockInventoryService,
      mockPartiesService,
      mockAuditService,
    );
  });

  it('blocks invoice finalization if stock is insufficient', async () => {
    mockPartyModel.findOne.mockResolvedValue({
      _id: 'cust-1',
      name: 'Rohan Traders',
      billingAddress: { state: 'Maharashtra', line1: 'Street 1', city: 'Mumbai' },
    });

    mockProductModel.find.mockResolvedValue([
      {
        _id: 'prod-1',
        name: 'Wireless Earbuds',
        sku: 'EAR-01',
        unit: 'PCS',
        sellingPriceMinor: 150000,
        taxRatePercent: 18,
        currentStock: 2, // only 2 in stock
      },
    ]);

    mockProductModel.findOne.mockResolvedValue({
      _id: 'prod-1',
      name: 'Wireless Earbuds',
      sku: 'EAR-01',
      unit: 'PCS',
      currentStock: 2, // only 2 in stock
    });

    // Requesting 5 units when only 2 are available
    await expect(
      service.create(
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
    ).rejects.toThrow(BadRequestException);
  });

  it('atomically reduces inventory and commits customer receivable on finalization', async () => {
    mockPartyModel.findOne.mockResolvedValue({
      _id: 'cust-1',
      name: 'Rohan Traders',
      billingAddress: { state: 'Maharashtra', line1: 'Street 1', city: 'Mumbai' },
    });

    mockProductModel.find.mockResolvedValue([
      {
        _id: 'prod-1',
        name: 'Wireless Earbuds',
        sku: 'EAR-01',
        unit: 'PCS',
        sellingPriceMinor: 150000,
        taxRatePercent: 18,
        currentStock: 10,
      },
    ]);

    mockProductModel.findOne.mockResolvedValue({
      _id: 'prod-1',
      name: 'Wireless Earbuds',
      sku: 'EAR-01',
      unit: 'PCS',
      currentStock: 10,
    });

    const result = await service.create(
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
    expect(mockInventoryService.recordMovement).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: 'biz-1',
        productId: 'prod-1',
        quantityDelta: -2,
        movementType: 'SALE',
      }),
    );
    expect(mockPartiesService.updateBalance).toHaveBeenCalledWith('biz-1', 'cust-1', result.grandTotalMinor);
    expect(mockAuditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'INVOICE_FINALIZE',
      }),
    );
  });
});
