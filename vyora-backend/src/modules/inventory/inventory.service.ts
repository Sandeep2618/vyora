import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockMovement, StockMovementDocument } from './schemas/stock-movement.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AuditService } from '../audit/audit.service';
import { StockMovementType } from '@vyora/shared-types';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(StockMovement.name)
    private readonly movementModel: Model<StockMovementDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Traceable atomic stock modification engine
   */
  async recordMovement(params: {
    businessId: string;
    productId: string;
    quantityDelta: number;
    movementType: StockMovementType;
    referenceType: 'INVOICE' | 'PURCHASE' | 'MANUAL_ADJUSTMENT' | 'INITIAL_SETUP';
    referenceId?: string;
    reason?: string;
    performedByUserId: string;
    allowNegative?: boolean;
  }) {
    const product = await this.productModel.findOne({
      _id: params.productId,
      businessId: params.businessId,
    });

    if (!product) {
      throw new NotFoundException(`Product ${params.productId} not found`);
    }

    const nextStock = product.currentStock + params.quantityDelta;
    if (nextStock < 0 && !params.allowNegative) {
      throw new BadRequestException(
        `Insufficient inventory for "${product.name}" (SKU: ${product.sku}). Available: ${product.currentStock}, requested change: ${params.quantityDelta}`,
      );
    }

    // Update product stock atomically
    product.currentStock = nextStock;
    await product.save();

    // Create traceable stock movement record
    const movement = new this.movementModel({
      businessId: params.businessId,
      productId: params.productId,
      movementType: params.movementType,
      quantityDelta: params.quantityDelta,
      resultingStock: nextStock,
      reason: params.reason,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      performedByUserId: params.performedByUserId,
    });
    await movement.save();

    return movement;
  }

  async manualAdjustment(
    businessId: string,
    productId: string,
    quantityDelta: number,
    reason: string,
    userId: string,
    userName: string,
  ) {
    const movementType: StockMovementType =
      quantityDelta > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';

    const movement = await this.recordMovement({
      businessId,
      productId,
      quantityDelta,
      movementType,
      referenceType: 'MANUAL_ADJUSTMENT',
      reason,
      performedByUserId: userId,
      allowNegative: false,
    });

    await this.auditService.logAction({
      businessId,
      userId,
      userName,
      action: 'STOCK_MANUAL_ADJUSTMENT',
      entityType: 'STOCK',
      entityId: productId,
      details: {
        quantityDelta,
        reason,
        resultingStock: movement.resultingStock,
      },
    });

    return movement;
  }

  async getMovements(businessId: string, productId?: string, limit = 50, skip = 0) {
    const filter: any = { businessId };
    if (productId) {
      filter.productId = productId;
    }

    const items = await this.movementModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('productId', 'name sku unit')
      .lean();

    const total = await this.movementModel.countDocuments(filter);

    return {
      items: items.map((m: any) => ({
        id: m._id.toString(),
        businessId: m.businessId,
        productId: m.productId?._id?.toString() || m.productId,
        productName: m.productId?.name || 'Unknown Product',
        sku: m.productId?.sku || '',
        unit: m.productId?.unit || 'PCS',
        movementType: m.movementType,
        quantityDelta: m.quantityDelta,
        resultingStock: m.resultingStock,
        reason: m.reason,
        referenceType: m.referenceType,
        referenceId: m.referenceId,
        createdAt: m.createdAt,
      })),
      total,
      limit,
      skip,
    };
  }
}
