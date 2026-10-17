import { ProductModel, IProduct } from '../model';
import { InventoryService } from '../../inventory/service';
import { ConflictError, NotFoundError } from '../../../util';
import { ProductInput } from '@vyora/validation';

export class ProductsService {
  static async create(businessId: string, dto: ProductInput, userId: string) {
    const existing = await ProductModel.findOne({
      businessId,
      sku: dto.sku.toUpperCase(),
      isArchived: false,
    });
    if (existing) {
      throw new ConflictError(`SKU "${dto.sku}" is already in use by another product`);
    }

    const openingStock = dto.openingStock || 0;

    const product = new ProductModel({
      businessId,
      name: dto.name,
      sku: dto.sku.toUpperCase(),
      hsnCode: dto.hsnCode,
      description: dto.description,
      imageUrl: dto.imageUrl,
      unit: dto.unit || 'PCS',
      sellingPriceMinor: dto.sellingPriceMinor,
      purchasePriceMinor: dto.purchasePriceMinor,
      taxRatePercent: dto.taxRatePercent,
      openingStock,
      currentStock: openingStock,
      reorderLevel: dto.reorderLevel !== undefined ? dto.reorderLevel : 5,
      isArchived: false,
    });
    await product.save();

    if (openingStock > 0) {
      await InventoryService.recordMovement({
        businessId,
        productId: product._id.toString(),
        quantityDelta: openingStock,
        movementType: 'OPENING',
        referenceType: 'MANUAL',
        reason: 'Initial opening stock',
        performedByUserId: userId,
        allowNegative: false,
      });
    }

    return this.mapProduct(product);
  }

  static async update(businessId: string, id: string, dto: ProductInput) {
    const product = await ProductModel.findOne({ _id: id, businessId });
    if (!product) {
      throw new NotFoundError('Product');
    }

    if (dto.sku.toUpperCase() !== product.sku) {
      const conflict = await ProductModel.findOne({
        businessId,
        sku: dto.sku.toUpperCase(),
        _id: { $ne: id },
        isArchived: false,
      });
      if (conflict) {
        throw new ConflictError(`SKU "${dto.sku}" is already used by another product`);
      }
    }

    product.name = dto.name;
    product.sku = dto.sku.toUpperCase();
    product.hsnCode = dto.hsnCode;
    product.description = dto.description;
    if (dto.imageUrl !== undefined) {
      product.imageUrl = dto.imageUrl;
    }
    product.unit = dto.unit || product.unit;
    product.sellingPriceMinor = dto.sellingPriceMinor;
    product.purchasePriceMinor = dto.purchasePriceMinor;
    product.taxRatePercent = dto.taxRatePercent;
    product.reorderLevel = dto.reorderLevel !== undefined ? dto.reorderLevel : product.reorderLevel;

    await product.save();
    return this.mapProduct(product);
  }

  static async findOne(businessId: string, id: string) {
    const product = await ProductModel.findOne({ _id: id, businessId });
    if (!product) {
      throw new NotFoundError('Product');
    }
    return this.mapProduct(product);
  }

  static async findAll(
    businessId: string,
    query: {
      search?: string;
      isArchived?: boolean;
      lowStockOnly?: boolean;
      limit?: number;
      skip?: number;
    },
  ) {
    const filter: any = { businessId };
    filter.isArchived = query.isArchived === true;

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { sku: regex }, { hsnCode: regex }];
    }

    if (query.lowStockOnly) {
      filter.$expr = { $lte: ['$currentStock', '$reorderLevel'] };
    }

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [items, total] = await Promise.all([
      ProductModel.find(filter).sort({ name: 1 }).limit(limit).skip(skip),
      ProductModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => this.mapProduct(p)),
      total,
      limit,
      skip,
    };
  }

  static async delete(businessId: string, id: string) {
    const product = await ProductModel.findOneAndUpdate(
      { _id: id, businessId },
      { isArchived: true },
      { new: true },
    );
    if (!product) {
      throw new NotFoundError('Product');
    }
    return { success: true, message: 'Product removed successfully' };
  }

  static async adjustStock(
    businessId: string,
    id: string,
    quantityDelta: number,
    reason = 'Stock Replenishment / Restock',
    userId?: string,
  ) {
    const product = await ProductModel.findOne({ _id: id, businessId, isArchived: false });
    if (!product) {
      throw new NotFoundError('Product');
    }

    product.currentStock = Math.max(0, product.currentStock + quantityDelta);
    await product.save();

    await InventoryService.recordMovement({
      businessId,
      productId: product._id.toString(),
      quantityDelta,
      movementType: quantityDelta >= 0 ? 'PURCHASE' : 'SALE',
      referenceType: 'MANUAL',
      reason,
      performedByUserId: userId || 'system',
      allowNegative: false,
    });

    return this.mapProduct(product);
  }

  private static mapProduct(product: IProduct) {
    return {
      id: product._id.toString(),
      _id: product._id.toString(),
      businessId: product.businessId,
      name: product.name,
      sku: product.sku,
      hsnCode: product.hsnCode,
      description: product.description,
      unit: product.unit,
      sellingPriceMinor: product.sellingPriceMinor,
      purchasePriceMinor: product.purchasePriceMinor,
      taxRatePercent: product.taxRatePercent,
      openingStock: product.openingStock,
      currentStock: product.currentStock,
      reorderLevel: product.reorderLevel,
      imageUrl: product.imageUrl || undefined,
      isArchived: product.isArchived,
      createdAt: (product as any).createdAt,
      updatedAt: (product as any).updatedAt,
    };
  }
}
