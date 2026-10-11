import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { InventoryService } from '../inventory/inventory.service';
import { ProductInput } from '@vyora/validation';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(businessId: string, dto: ProductInput, userId: string) {
    const existing = await this.productModel.findOne({
      businessId,
      sku: dto.sku.toUpperCase(),
      isArchived: false,
    });
    if (existing) {
      throw new ConflictException(`A product with SKU "${dto.sku}" already exists`);
    }

    const product = new this.productModel({
      businessId,
      name: dto.name,
      sku: dto.sku.toUpperCase(),
      hsnCode: dto.hsnCode,
      description: dto.description,
      unit: dto.unit,
      sellingPriceMinor: dto.sellingPriceMinor,
      purchasePriceMinor: dto.purchasePriceMinor,
      taxRatePercent: dto.taxRatePercent,
      openingStock: dto.openingStock || 0,
      currentStock: dto.openingStock || 0,
      reorderLevel: dto.reorderLevel || 5,
      isArchived: false,
    });
    await product.save();

    // Record initial stock opening movement if stock > 0
    if (dto.openingStock && dto.openingStock > 0) {
      await this.inventoryService.recordMovement({
        businessId,
        productId: product._id.toString(),
        quantityDelta: dto.openingStock,
        movementType: 'OPENING',
        referenceType: 'INITIAL_SETUP',
        reason: 'Opening stock balance',
        performedByUserId: userId,
      });
    }

    return this.mapProduct(product);
  }

  async update(businessId: string, id: string, dto: ProductInput) {
    const product = await this.productModel.findOne({ _id: id, businessId });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check SKU conflict
    if (dto.sku.toUpperCase() !== product.sku) {
      const conflict = await this.productModel.findOne({
        businessId,
        sku: dto.sku.toUpperCase(),
        _id: { $ne: id },
        isArchived: false,
      });
      if (conflict) {
        throw new ConflictException(`SKU "${dto.sku}" is already used by another product`);
      }
    }

    product.name = dto.name;
    product.sku = dto.sku.toUpperCase();
    product.hsnCode = dto.hsnCode;
    product.description = dto.description;
    product.unit = dto.unit;
    product.sellingPriceMinor = dto.sellingPriceMinor;
    product.purchasePriceMinor = dto.purchasePriceMinor;
    product.taxRatePercent = dto.taxRatePercent;
    product.reorderLevel = dto.reorderLevel;

    await product.save();
    return this.mapProduct(product);
  }

  async findOne(businessId: string, id: string) {
    const product = await this.productModel.findOne({ _id: id, businessId });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.mapProduct(product);
  }

  async findAll(
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
      this.productModel.find(filter).sort({ name: 1 }).limit(limit).skip(skip),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => this.mapProduct(p)),
      total,
      limit,
      skip,
    };
  }

  async delete(businessId: string, id: string) {
    const product = await this.productModel.findOneAndUpdate(
      { _id: id, businessId },
      { isArchived: true },
      { new: true },
    );
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { success: true, message: 'Product deleted successfully' };
  }

  async archive(businessId: string, id: string) {
    return this.delete(businessId, id);
  }

  private mapProduct(doc: ProductDocument) {
    return {
      id: doc._id.toString(),
      businessId: doc.businessId,
      name: doc.name,
      sku: doc.sku,
      hsnCode: doc.hsnCode,
      description: doc.description,
      unit: doc.unit,
      sellingPriceMinor: doc.sellingPriceMinor,
      purchasePriceMinor: doc.purchasePriceMinor,
      taxRatePercent: doc.taxRatePercent,
      openingStock: doc.openingStock,
      currentStock: doc.currentStock,
      reorderLevel: doc.reorderLevel,
      isArchived: doc.isArchived,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
