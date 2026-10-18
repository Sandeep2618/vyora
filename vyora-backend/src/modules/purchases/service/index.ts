import { PurchaseBillModel, IPurchaseBill } from '../model';
import { PartyModel } from '../../parties/model';
import { ProductModel } from '../../products/model';
import { InventoryService } from '../../inventory/service';
import { PartiesService } from '../../parties/service';
import { AuditService } from '../../audit/service';
import { NotFoundError } from '../../../util';
import { CreatePurchaseInput } from '../validator';
import { PaymentModel } from '../../payments/model';
import { formatDocumentNumber } from '@vyora/utils';

export class PurchasesService {
  static async create(businessId: string, dto: CreatePurchaseInput, userId: string, userName: string) {
    const supplier = await PartyModel.findOne({
      _id: dto.supplierId,
      businessId,
    });
    if (!supplier) {
      throw new NotFoundError('Supplier');
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await ProductModel.find({
      _id: { $in: productIds },
      businessId,
    });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotalMinor = 0;
    let totalTaxMinor = 0;

    const purchaseLines = dto.items.map((item) => {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new NotFoundError(`Product ${item.productId}`);
      }

      const taxableMinor = Math.round(item.quantity * item.unitPriceMinor);
      const taxMinor = Math.round((taxableMinor * item.taxRatePercent) / 100);
      const lineTotalMinor = taxableMinor + taxMinor;

      subtotalMinor += taxableMinor;
      totalTaxMinor += taxMinor;

      return {
        productId: prod._id.toString(),
        productName: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        taxRatePercent: item.taxRatePercent,
        taxableAmountMinor: taxableMinor,
        totalTaxMinor: taxMinor,
        lineTotalMinor,
      };
    });

    const grandTotalMinor = subtotalMinor + totalTaxMinor;

    const paidAmountMinor = dto.paymentMethod
      ? (dto.paidAmountMinor !== undefined
          ? Math.min(dto.paidAmountMinor, grandTotalMinor)
          : grandTotalMinor)
      : 0;
    const dueAmountMinor = grandTotalMinor - paidAmountMinor;
    const status = dueAmountMinor === 0 ? 'PAID' : (paidAmountMinor > 0 ? 'PARTIAL' : 'RECEIVED');

    const purchase = new PurchaseBillModel({
      businessId,
      billNumber: dto.billNumber,
      supplierId: supplier._id.toString(),
      supplierSnapshot: {
        name: supplier.name,
        phone: supplier.phone,
        gstin: supplier.gstin,
        state: supplier.billingAddress?.state,
      },
      billDate: dto.billDate,
      dueDate: dto.dueDate,
      status,
      items: purchaseLines,
      subtotalMinor,
      totalTaxMinor,
      grandTotalMinor,
      paidAmountMinor,
      dueAmountMinor,
      notes: dto.notes,
      createdByUserId: userId,
    });

    await purchase.save();

    // Traceably increase inventory
    for (const line of purchaseLines) {
      await InventoryService.recordMovement({
        businessId,
        productId: line.productId,
        quantityDelta: line.quantity,
        movementType: 'PURCHASE',
        referenceType: 'PURCHASE',
        referenceId: purchase._id.toString(),
        reason: `Purchase Bill ${dto.billNumber}`,
        performedByUserId: userId,
      });
    }

    // Update supplier payable balance (only remaining due adds to supplier payable debt)
    if (dueAmountMinor > 0) {
      await PartiesService.updateBalance(
        businessId,
        supplier._id.toString(),
        -dueAmountMinor,
      );
    }

    // If upfront payment was made to supplier, record official Payment voucher
    if (paidAmountMinor > 0 && dto.paymentMethod) {
      const paymentCount = await PaymentModel.countDocuments({ businessId });
      const paymentNumber = formatDocumentNumber('PAY-', paymentCount + 1, 4);

      const payment = new PaymentModel({
        businessId,
        paymentNumber,
        type: 'PAYMENT',
        partyId: supplier._id.toString(),
        partyName: supplier.name,
        purchaseBillId: purchase._id.toString(),
        amountMinor: paidAmountMinor,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.billDate,
        notes: `Payment for Purchase Bill ${dto.billNumber}`,
        idempotencyKey: `pur-pay-${purchase._id.toString()}`,
        receivedByUserId: userId,
      });
      await payment.save();

      await AuditService.logAction({
        businessId,
        userId,
        userName,
        action: 'SUPPLIER_PAYMENT',
        entityType: 'PAYMENT',
        entityId: payment._id.toString(),
        details: {
          paymentNumber,
          amountMinor: paidAmountMinor,
          partyName: supplier.name,
          purchaseBillId: purchase._id.toString(),
          paymentMethod: dto.paymentMethod,
        },
      });
    }

    await AuditService.logAction({
      businessId,
      userId,
      userName,
      action: 'PURCHASE_RECEIVE',
      entityType: 'PURCHASE',
      entityId: purchase._id.toString(),
      details: {
        billNumber: dto.billNumber,
        grandTotalMinor,
        paidAmountMinor,
        dueAmountMinor,
      },
    });

    return this.mapPurchase(purchase);
  }

  static async findAll(businessId: string, limit = 50, skip = 0) {
    const [items, total] = await Promise.all([
      PurchaseBillModel.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      PurchaseBillModel.countDocuments({ businessId }),
    ]);

    return {
      items: items.map((p) => this.mapPurchase(p)),
      total,
      limit,
      skip,
    };
  }

  static async findOne(businessId: string, id: string) {
    const purchase = await PurchaseBillModel.findOne({ _id: id, businessId });
    if (!purchase) {
      throw new NotFoundError('Purchase bill');
    }
    return this.mapPurchase(purchase);
  }

  static mapPurchase(doc: IPurchaseBill) {
    return {
      id: doc._id.toString(),
      businessId: doc.businessId,
      billNumber: doc.billNumber,
      supplierId: doc.supplierId,
      supplierSnapshot: doc.supplierSnapshot,
      billDate: doc.billDate,
      dueDate: doc.dueDate,
      status: doc.status,
      items: doc.items,
      subtotalMinor: doc.subtotalMinor,
      totalTaxMinor: doc.totalTaxMinor,
      grandTotalMinor: doc.grandTotalMinor,
      paidAmountMinor: doc.paidAmountMinor,
      dueAmountMinor: doc.dueAmountMinor,
      notes: doc.notes,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }

  static async getExportData(
    businessId: string,
    query: {
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const filter: any = { businessId };
    if (query.status) filter.status = query.status;
    if (query.startDate || query.endDate) {
      filter.billDate = {};
      if (query.startDate) filter.billDate.$gte = query.startDate;
      if (query.endDate) filter.billDate.$lte = query.endDate;
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { billNumber: regex },
        { 'supplierSnapshot.name': regex },
        { 'supplierSnapshot.phone': regex },
      ];
    }

    return PurchaseBillModel.find(filter).sort({ billDate: -1, createdAt: -1 }).lean();
  }
}
