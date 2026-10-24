import { InventoryMovementModel, IInventoryMovement } from '../model';
import { ProductModel } from '../../products/model';
import { NotFoundError, BadRequestError } from '../../../util';

export class InventoryService {
  static async recordMovement(params: {
    businessId: string;
    productId: string;
    quantityDelta: number;
    movementType: string;
    referenceType?: string;
    referenceId?: string;
    reason?: string;
    performedByUserId: string;
    allowNegative?: boolean;
  }): Promise<IInventoryMovement> {
    const filter: Record<string, any> = {
      _id: params.productId,
      businessId: params.businessId,
    };

    if (!params.allowNegative && params.quantityDelta < 0) {
      filter.currentStock = { $gte: Math.abs(params.quantityDelta) };
    }

    const updatedProduct = await ProductModel.findOneAndUpdate(
      filter,
      { $inc: { currentStock: params.quantityDelta } },
      { new: true },
    );

    if (!updatedProduct) {
      const exists = await ProductModel.findOne({
        _id: params.productId,
        businessId: params.businessId,
      });

      if (!exists) {
        throw new NotFoundError(`Product ${params.productId}`);
      }

      throw new BadRequestError(
        `Insufficient inventory for "${exists.name}" (SKU: ${exists.sku}). Available: ${exists.currentStock}, requested change: ${params.quantityDelta}`,
      );
    }

    const nextStock = updatedProduct.currentStock;

    const movement = new InventoryMovementModel({
      businessId: params.businessId,
      productId: params.productId,
      movementType: params.movementType,
      quantityDelta: params.quantityDelta,
      resultingStock: nextStock,
      balanceAfter: nextStock,
      reason: params.reason,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      performedByUserId: params.performedByUserId,
    });
    await movement.save();

    return movement;
  }

  static async manualAdjustment(
    businessId: string,
    productId: string,
    quantityDelta: number,
    reason: string,
    userId: string,
  ) {
    let movementType = quantityDelta > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
    const lowerReason = (reason || '').toLowerCase();
    if (quantityDelta < 0) {
      if (lowerReason.includes('damag') || lowerReason.includes('broken')) {
        movementType = 'ADJUSTMENT_DAMAGE';
      } else if (lowerReason.includes('expir') || lowerReason.includes('spoil')) {
        movementType = 'ADJUSTMENT_EXPIRED';
      } else if (lowerReason.includes('loss') || lowerReason.includes('theft') || lowerReason.includes('stolen')) {
        movementType = 'ADJUSTMENT_LOSS';
      }
    }

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

    const product = await ProductModel.findOne({ _id: productId, businessId });

    return {
      id: movement._id.toString(),
      _id: movement._id.toString(),
      businessId: movement.businessId,
      productId: movement.productId,
      productName: product?.name || 'Unknown Item',
      sku: product?.sku || '-',
      unit: product?.unit || 'PCS',
      movementType: movement.movementType,
      quantityDelta: movement.quantityDelta,
      resultingStock: movement.resultingStock,
      balanceAfter: movement.balanceAfter ?? movement.resultingStock,
      reason: movement.reason,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      performedByUserId: movement.performedByUserId,
      createdAt: (movement as any).createdAt,
      updatedAt: (movement as any).updatedAt,
    };
  }

  static async getAllMovements(
    businessId: string,
    query: { productId?: string; limit?: number; skip?: number },
  ) {
    const filter: any = { businessId };
    if (query.productId) {
      filter.productId = query.productId;
    }
    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [movements, total] = await Promise.all([
      InventoryMovementModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      InventoryMovementModel.countDocuments(filter),
    ]);

    const productIds = Array.from(new Set(movements.map((m) => m.productId)));
    const products = await ProductModel.find({ _id: { $in: productIds }, businessId });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const items = movements.map((m) => {
      const prod = productMap.get(m.productId);
      return {
        id: m._id.toString(),
        _id: m._id.toString(),
        businessId: m.businessId,
        productId: m.productId,
        productName: prod?.name || 'Unknown Item',
        sku: prod?.sku || '-',
        unit: prod?.unit || 'PCS',
        movementType: m.movementType,
        quantityDelta: m.quantityDelta,
        resultingStock: m.resultingStock,
        balanceAfter: m.balanceAfter ?? m.resultingStock,
        reason: m.reason || '',
        referenceType: m.referenceType,
        referenceId: m.referenceId,
        performedByUserId: m.performedByUserId,
        createdAt: (m as any).createdAt,
      };
    });

    return {
      items,
      total,
      limit,
      skip,
    };
  }

  static async getProductLedger(businessId: string, productId: string, limit = 50) {
    const [product, movements] = await Promise.all([
      ProductModel.findOne({ _id: productId, businessId }),
      InventoryMovementModel.find({ businessId, productId })
        .sort({ createdAt: -1 })
        .limit(limit),
    ]);

    if (!product) {
      throw new NotFoundError(`Product ${productId}`);
    }

    return {
      productId,
      productName: product.name,
      sku: product.sku,
      currentStock: product.currentStock,
      movements: movements.map((m) => ({
        id: m._id.toString(),
        movementType: m.movementType,
        quantityDelta: m.quantityDelta,
        resultingStock: m.resultingStock,
        reason: m.reason,
        referenceType: m.referenceType,
        referenceId: m.referenceId,
        createdAt: (m as any).createdAt,
      })),
    };
  }

  static async getExportData(
    businessId: string,
    query: {
      productId?: string;
      movementType?: string;
      search?: string;
    },
  ) {
    const filter: any = { businessId };
    if (query.productId) {
      filter.productId = query.productId;
    }
    if (query.movementType) {
      filter.movementType = query.movementType;
    }

    const movements = await InventoryMovementModel.find(filter).sort({ createdAt: -1 }).lean();
    const productIds = Array.from(new Set(movements.map((m) => m.productId)));
    const products = await ProductModel.find({ _id: { $in: productIds }, businessId }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let items = movements.map((m) => {
      const prod = productMap.get(m.productId);
      return {
        ...m,
        productName: prod?.name || 'Unknown Item',
        sku: prod?.sku || '-',
        unit: prod?.unit || 'PCS',
        balanceAfter: m.balanceAfter ?? m.resultingStock,
      };
    });

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.productName.toLowerCase().includes(s) ||
          i.sku.toLowerCase().includes(s) ||
          (i.reason && i.reason.toLowerCase().includes(s)) ||
          i.movementType.toLowerCase().includes(s),
      );
    }

    return items;
  }
}
