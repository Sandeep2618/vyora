import { PurchaseBillModel, IPurchaseBill } from '../model';
import { PartyModel } from '../../parties/model';
import { ProductModel } from '../../products/model';
import { BusinessModel } from '../../business/model';
import { InventoryService } from '../../inventory/service';
import { PartiesService } from '../../parties/service';
import { AuditService } from '../../audit/service';
import { NotFoundError } from '../../../util';
import { CreatePurchaseInput } from '../validator';
import { PaymentModel } from '../../payments/model';
import { formatDocumentNumber } from '@vyora/utils';

export class PurchasesService {
  static async create(businessId: string, dto: CreatePurchaseInput, userId: string, userName: string) {
    const [supplier, business] = await Promise.all([
      PartyModel.findOne({ _id: dto.supplierId, businessId }),
      BusinessModel.findById(businessId),
    ]);

    if (!supplier) {
      throw new NotFoundError('Supplier');
    }

    const supplierState = supplier.billingAddress?.state?.trim().toLowerCase();
    const businessState = business?.state?.trim().toLowerCase();
    const isInterState = Boolean(supplierState && businessState && supplierState !== businessState);

    const productIds = dto.items.map((i) => i.productId);
    const products = await ProductModel.find({
      _id: { $in: productIds },
      businessId,
    });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotalMinor = 0;
    let totalTaxMinor = 0;
    let totalCgstMinor = 0;
    let totalSgstMinor = 0;
    let totalIgstMinor = 0;

    const purchaseLines = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      const name = product ? product.name : 'Unknown Item';
      const sku = product ? product.sku : '-';
      const hsnCode = product ? product.hsnCode : undefined;
      const unit = product ? product.unit : 'PCS';

      const lineTaxRate = item.taxRatePercent !== undefined ? item.taxRatePercent : product?.taxRatePercent || 0;
      const lineSubtotal = Math.round(item.unitPriceMinor * item.quantity);

      let lineCgst = 0;
      let lineSgst = 0;
      let lineIgst = 0;
      let lineTax = 0;

      if (lineTaxRate > 0) {
        const computedTax = Math.round((lineSubtotal * lineTaxRate) / 100);
        lineTax = computedTax;
        if (isInterState) {
          lineIgst = computedTax;
        } else {
          lineCgst = Math.floor(computedTax / 2);
          lineSgst = computedTax - lineCgst;
        }
      }

      const lineTotal = lineSubtotal + lineTax;

      subtotalMinor += lineSubtotal;
      totalTaxMinor += lineTax;
      totalCgstMinor += lineCgst;
      totalSgstMinor += lineSgst;
      totalIgstMinor += lineIgst;

      return {
        productId: item.productId,
        productName: name,
        name,
        sku,
        hsnCode,
        unit,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        taxRatePercent: lineTaxRate,
        taxableAmountMinor: lineSubtotal,
        cgstMinor: lineCgst,
        sgstMinor: lineSgst,
        igstMinor: lineIgst,
        lineTaxMinor: lineTax,
        totalTaxMinor: lineTax,
        lineTotalMinor: lineTotal,
      };
    });

    const grandTotalMinor = subtotalMinor + totalTaxMinor;
    const paidAmountMinor = Math.min(dto.paidAmountMinor || 0, grandTotalMinor);
    const dueAmountMinor = grandTotalMinor - paidAmountMinor;

    let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';
    if (dueAmountMinor === 0) {
      status = 'PAID';
    } else if (paidAmountMinor > 0) {
      status = 'PARTIAL';
    }

    const purchase = new PurchaseBillModel({
      businessId,
      billNumber: dto.billNumber,
      supplierId: supplier._id.toString(),
      supplierSnapshot: {
        name: supplier.name,
        phone: supplier.phone || '',
        gstin: supplier.gstin,
        state: supplier.billingAddress?.state,
        stateCode: supplier.billingAddress?.stateCode,
      },
      billDate: dto.billDate,
      dueDate: dto.dueDate,
      status,
      items: purchaseLines,
      subtotalMinor,
      totalTaxMinor,
      cgstMinor: totalCgstMinor,
      sgstMinor: totalSgstMinor,
      igstMinor: totalIgstMinor,
      isInterState,
      grandTotalMinor,
      paidAmountMinor,
      dueAmountMinor,
      notes: dto.notes,
      createdByUserId: userId,
    });

    await purchase.save();

    // Traceably increase inventory and update latest inward purchase cost in product catalog master
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

      if (line.unitPriceMinor > 0) {
        await ProductModel.findOneAndUpdate(
          { _id: line.productId, businessId },
          { $set: { purchasePriceMinor: line.unitPriceMinor } },
        );
      }
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
        cgstMinor: totalCgstMinor,
        sgstMinor: totalSgstMinor,
        igstMinor: totalIgstMinor,
        isInterState,
      },
    });

    return this.mapPurchase(purchase);
  }

  static async findAll(businessId: string, limit = 50, skip = 0, supplierId?: string) {
    const filter: Record<string, any> = { businessId, isDeleted: { $ne: true } };
    if (supplierId) {
      filter.supplierId = supplierId;
    }
    const [items, total] = await Promise.all([
      PurchaseBillModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      PurchaseBillModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => this.mapPurchase(p)),
      total,
      limit,
      skip,
    };
  }

  static async findOne(businessId: string, id: string) {
    const purchase = await PurchaseBillModel.findOne({ _id: id, businessId, isDeleted: { $ne: true } });
    if (!purchase) {
      throw new NotFoundError('Purchase bill');
    }
    return this.mapPurchase(purchase);
  }

  static async softDelete(businessId: string, id: string, userId?: string, reason?: string) {
    const bill = await PurchaseBillModel.findOneAndUpdate(
      { _id: id, businessId, isDeleted: { $ne: true } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedByUserId: userId,
          deleteReason: reason || 'Deleted by merchant',
        },
      },
      { new: true },
    );
    if (!bill) {
      throw new NotFoundError('Purchase bill');
    }
    return { success: true, message: 'Purchase bill moved to Recycle Bin' };
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
      cgstMinor: doc.cgstMinor ?? 0,
      sgstMinor: doc.sgstMinor ?? 0,
      igstMinor: doc.igstMinor ?? 0,
      isInterState: doc.isInterState ?? false,
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
