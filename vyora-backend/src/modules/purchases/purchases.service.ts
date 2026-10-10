import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseBill, PurchaseBillDocument } from './schemas/purchase.schema';
import { Party, PartyDocument } from '../parties/schemas/party.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { InventoryService } from '../inventory/inventory.service';
import { PartiesService } from '../parties/parties.service';
import { AuditService } from '../audit/audit.service';
import { CreatePurchaseInput } from '@vyora/validation';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(PurchaseBill.name)
    private readonly purchaseModel: Model<PurchaseBillDocument>,
    @InjectModel(Party.name)
    private readonly partyModel: Model<PartyDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly inventoryService: InventoryService,
    private readonly partiesService: PartiesService,
    private readonly auditService: AuditService,
  ) {}

  async create(businessId: string, dto: CreatePurchaseInput, userId: string, userName: string) {
    const supplier = await this.partyModel.findOne({
      _id: dto.supplierId,
      businessId,
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.productModel.find({
      _id: { $in: productIds },
      businessId,
    });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotalMinor = 0;
    let totalTaxMinor = 0;

    const purchaseLines = dto.items.map((item) => {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new NotFoundException(`Product ${item.productId} not found`);
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

    const purchase = new this.purchaseModel({
      businessId,
      billNumber: dto.billNumber,
      supplierId: supplier._id.toString(),
      supplierSnapshot: {
        name: supplier.name,
        phone: supplier.phone,
        gstin: supplier.gstin,
        state: supplier.billingAddress.state,
      },
      billDate: dto.billDate,
      dueDate: dto.dueDate,
      status: 'RECEIVED',
      items: purchaseLines,
      subtotalMinor,
      totalTaxMinor,
      grandTotalMinor,
      paidAmountMinor: 0,
      dueAmountMinor: grandTotalMinor,
      notes: dto.notes,
      createdByUserId: userId,
    });

    await purchase.save();

    // Traceably increase inventory
    for (const line of purchaseLines) {
      await this.inventoryService.recordMovement({
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

    // Update supplier payable balance (negative balance = money owed to supplier)
    await this.partiesService.updateBalance(
      businessId,
      supplier._id.toString(),
      -grandTotalMinor,
    );

    await this.auditService.logAction({
      businessId,
      userId,
      userName,
      action: 'PURCHASE_RECEIVE',
      entityType: 'PURCHASE',
      entityId: purchase._id.toString(),
      details: {
        billNumber: dto.billNumber,
        grandTotalMinor,
      },
    });

    return this.mapPurchase(purchase);
  }

  async findAll(businessId: string, limit = 50, skip = 0) {
    const [items, total] = await Promise.all([
      this.purchaseModel
        .find({ businessId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      this.purchaseModel.countDocuments({ businessId }),
    ]);

    return {
      items: items.map((p) => this.mapPurchase(p)),
      total,
      limit,
      skip,
    };
  }

  async findOne(businessId: string, id: string) {
    const purchase = await this.purchaseModel.findOne({ _id: id, businessId });
    if (!purchase) {
      throw new NotFoundException('Purchase bill not found');
    }
    return this.mapPurchase(purchase);
  }

  private mapPurchase(doc: PurchaseBillDocument) {
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
}
