import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { Party, PartyDocument } from '../parties/schemas/party.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { BusinessService } from '../business/business.service';
import { InventoryService } from '../inventory/inventory.service';
import { PartiesService } from '../parties/parties.service';
import { AuditService } from '../audit/audit.service';
import { CreateInvoiceInput, CancelInvoiceInput } from '@vyora/validation';
import {
  calculateLineItem,
  calculateInvoiceTotals,
  formatDocumentNumber,
} from '@vyora/utils';
import { InvoiceStatus } from '@vyora/shared-types';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Party.name)
    private readonly partyModel: Model<PartyDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly businessService: BusinessService,
    private readonly inventoryService: InventoryService,
    private readonly partiesService: PartiesService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Authoritative calculation and preview
   */
  async calculateAndBuildInvoiceData(
    businessId: string,
    dto: CreateInvoiceInput,
  ) {
    const [business, customer] = await Promise.all([
      this.businessService.getBusinessById(businessId),
      this.partyModel.findOne({ _id: dto.customerId, businessId }),
    ]);

    if (!customer) {
      throw new NotFoundException('Selected customer not found');
    }

    // Determine GST tax jurisdiction (intra-state vs inter-state)
    const isInterState =
      dto.isInterState !== undefined
        ? dto.isInterState
        : business.state.trim().toLowerCase() !==
          customer.billingAddress.state.trim().toLowerCase();

    // Fetch and validate product details
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.productModel.find({
      _id: { $in: productIds },
      businessId,
    });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const calculatedLines = dto.items.map((item) => {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new NotFoundException(`Product ${item.productId} not found in business catalog`);
      }

      return calculateLineItem(
        {
          productId: prod._id.toString(),
          productName: prod.name,
          sku: prod.sku,
          hsnCode: prod.hsnCode,
          unit: prod.unit,
          quantity: item.quantity,
          unitPriceMinor: item.unitPriceMinor ?? prod.sellingPriceMinor,
          discountPercent: item.discountPercent || 0,
          taxRatePercent: item.taxRatePercent ?? prod.taxRatePercent,
        },
        isInterState,
      );
    });

    const totals = calculateInvoiceTotals(calculatedLines, dto.roundOff !== false);

    return {
      business,
      customer,
      isInterState,
      calculatedLines,
      totals,
    };
  }

  async previewInvoice(businessId: string, dto: CreateInvoiceInput) {
    const { business, customer, isInterState, calculatedLines, totals } =
      await this.calculateAndBuildInvoiceData(businessId, dto);

    return {
      businessSnapshot: {
        name: business.name,
        legalName: business.legalName,
        phone: business.phone,
        email: business.email,
        gstin: business.gstin,
        address: `${business.addressLine1}${business.addressLine2 ? ', ' + business.addressLine2 : ''}`,
        city: business.city,
        state: business.state,
        pincode: business.pincode,
      },
      customerSnapshot: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        gstin: customer.gstin,
        address: `${customer.billingAddress.line1}, ${customer.billingAddress.city}`,
        state: customer.billingAddress.state,
        stateCode: customer.billingAddress.stateCode,
      },
      isInterState,
      items: calculatedLines,
      ...totals,
    };
  }

  async create(
    businessId: string,
    dto: CreateInvoiceInput,
    userId: string,
    finalizeImmediately: boolean = false,
  ) {
    const { business, customer, isInterState, calculatedLines, totals } =
      await this.calculateAndBuildInvoiceData(businessId, dto);

    // If finalizing immediately, check stock sufficiency
    if (finalizeImmediately) {
      for (const line of calculatedLines) {
        const prod = await this.productModel.findOne({ _id: line.productId, businessId });
        if (!prod || prod.currentStock < line.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${line.productName}" (SKU: ${line.sku}). Available: ${prod?.currentStock || 0}, Required: ${line.quantity}`,
          );
        }
      }
    }

    let invoiceNumber: string;
    let status: InvoiceStatus = 'DRAFT';

    if (finalizeImmediately) {
      const nextSeq = await this.businessService.acquireNextInvoiceNumber(businessId);
      invoiceNumber = formatDocumentNumber(
        business.invoicePrefix || 'INV-',
        nextSeq,
        business.invoiceNumberPadding || 4,
      );
      status = 'UNPAID';
    } else {
      invoiceNumber = `DRAFT-${Date.now().toString().slice(-6)}`;
    }

    const invoice = new this.invoiceModel({
      businessId,
      invoiceNumber,
      status,
      customerId: customer._id.toString(),
      customerSnapshot: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        gstin: customer.gstin,
        address: `${customer.billingAddress.line1}, ${customer.billingAddress.city}`,
        state: customer.billingAddress.state,
        stateCode: customer.billingAddress.stateCode,
      },
      businessSnapshot: {
        name: business.name,
        legalName: business.legalName,
        phone: business.phone,
        email: business.email,
        gstin: business.gstin,
        address: `${business.addressLine1}${business.addressLine2 ? ', ' + business.addressLine2 : ''}`,
        city: business.city,
        state: business.state,
        pincode: business.pincode,
      },
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      isInterState,
      items: calculatedLines,
      subtotalMinor: totals.subtotalMinor,
      totalDiscountMinor: totals.totalDiscountMinor,
      totalTaxableAmountMinor: totals.totalTaxableAmountMinor,
      cgstMinor: totals.cgstMinor,
      sgstMinor: totals.sgstMinor,
      igstMinor: totals.igstMinor,
      totalTaxMinor: totals.totalTaxMinor,
      roundOffMinor: totals.roundOffMinor,
      grandTotalMinor: totals.grandTotalMinor,
      paidAmountMinor: 0,
      dueAmountMinor: totals.grandTotalMinor,
      notes: dto.notes,
      terms: dto.terms || business.termsAndConditions,
      createdByUserId: userId,
    });

    await invoice.save();

    // If finalized, atomically commit inventory movements and update customer receivable balance
    if (finalizeImmediately) {
      for (const line of calculatedLines) {
        await this.inventoryService.recordMovement({
          businessId,
          productId: line.productId,
          quantityDelta: -line.quantity,
          movementType: 'SALE',
          referenceType: 'INVOICE',
          referenceId: invoice._id.toString(),
          reason: `Sale Invoice ${invoiceNumber}`,
          performedByUserId: userId,
          allowNegative: false,
        });
      }

      await this.partiesService.updateBalance(
        businessId,
        customer._id.toString(),
        totals.grandTotalMinor,
      );

      await this.auditService.logAction({
        businessId,
        userId,
        userName: 'User',
        action: 'INVOICE_FINALIZE',
        entityType: 'INVOICE',
        entityId: invoice._id.toString(),
        details: {
          invoiceNumber,
          grandTotalMinor: totals.grandTotalMinor,
          itemCount: calculatedLines.length,
        },
      });
    }

    return this.mapInvoice(invoice);
  }

  /**
   * Finalize an existing draft invoice
   */
  async finalize(
    businessId: string,
    id: string,
    userId: string,
    userName: string,
  ) {
    const invoice = await this.invoiceModel.findOne({ _id: id, businessId });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(`Invoice is already in "${invoice.status}" status`);
    }

    // Verify stock availability
    for (const item of invoice.items) {
      const prod = await this.productModel.findOne({ _id: item.productId, businessId });
      if (!prod || prod.currentStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.productName}". Available: ${prod?.currentStock || 0}, Required: ${item.quantity}`,
        );
      }
    }

    const business = await this.businessService.getBusinessById(businessId);
    const nextSeq = await this.businessService.acquireNextInvoiceNumber(businessId);
    const invoiceNumber = formatDocumentNumber(
      business.invoicePrefix || 'INV-',
      nextSeq,
      business.invoiceNumberPadding || 4,
    );

    invoice.invoiceNumber = invoiceNumber;
    invoice.status = 'UNPAID';
    await invoice.save();

    // Record stock reduction movements
    for (const item of invoice.items) {
      await this.inventoryService.recordMovement({
        businessId,
        productId: item.productId,
        quantityDelta: -item.quantity,
        movementType: 'SALE',
        referenceType: 'INVOICE',
        referenceId: invoice._id.toString(),
        reason: `Sale Invoice ${invoiceNumber}`,
        performedByUserId: userId,
        allowNegative: false,
      });
    }

    // Update customer receivable balance
    await this.partiesService.updateBalance(
      businessId,
      invoice.customerId,
      invoice.grandTotalMinor,
    );

    await this.auditService.logAction({
      businessId,
      userId,
      userName,
      action: 'INVOICE_FINALIZE',
      entityType: 'INVOICE',
      entityId: invoice._id.toString(),
      details: {
        invoiceNumber,
        grandTotalMinor: invoice.grandTotalMinor,
      },
    });

    return this.mapInvoice(invoice);
  }

  /**
   * Controlled cancellation of invoice with audit trail & stock reversal
   */
  async cancel(
    businessId: string,
    id: string,
    dto: CancelInvoiceInput,
    userId: string,
    userName: string,
  ) {
    const invoice = await this.invoiceModel.findOne({ _id: id, businessId });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException('Invoice is already cancelled');
    }

    if (invoice.paidAmountMinor > 0) {
      throw new BadRequestException(
        'Cannot cancel an invoice with recorded payments. Please reverse payments first.',
      );
    }

    const previousStatus = invoice.status;
    invoice.status = 'CANCELLED';
    invoice.cancelReason = dto.reason;
    invoice.cancelledAt = new Date().toISOString();
    invoice.cancelledByUserId = userId;
    await invoice.save();

    // If it was finalized, reverse stock and customer balance
    if (previousStatus !== 'DRAFT') {
      for (const item of invoice.items) {
        await this.inventoryService.recordMovement({
          businessId,
          productId: item.productId,
          quantityDelta: item.quantity,
          movementType: 'SALE_CANCEL',
          referenceType: 'INVOICE',
          referenceId: invoice._id.toString(),
          reason: `Cancelled Invoice ${invoice.invoiceNumber}: ${dto.reason}`,
          performedByUserId: userId,
          allowNegative: true,
        });
      }

      await this.partiesService.updateBalance(
        businessId,
        invoice.customerId,
        -invoice.dueAmountMinor,
      );
    }

    await this.auditService.logAction({
      businessId,
      userId,
      userName,
      action: 'INVOICE_CANCEL',
      entityType: 'INVOICE',
      entityId: invoice._id.toString(),
      details: {
        invoiceNumber: invoice.invoiceNumber,
        reason: dto.reason,
        reversedAmountMinor: invoice.grandTotalMinor,
      },
    });

    return this.mapInvoice(invoice);
  }

  async findOne(businessId: string, id: string) {
    const invoice = await this.invoiceModel.findOne({ _id: id, businessId });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return this.mapInvoice(invoice);
  }

  async findAll(
    businessId: string,
    query: {
      status?: InvoiceStatus;
      customerId?: string;
      search?: string;
      limit?: number;
      skip?: number;
    },
  ) {
    const filter: any = { businessId };

    if (query.status) {
      filter.status = query.status;
    }
    if (query.customerId) {
      filter.customerId = query.customerId;
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { invoiceNumber: regex },
        { 'customerSnapshot.name': regex },
        { 'customerSnapshot.phone': regex },
      ];
    }

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [items, total] = await Promise.all([
      this.invoiceModel.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip),
      this.invoiceModel.countDocuments(filter),
    ]);

    return {
      items: items.map((inv) => this.mapInvoice(inv)),
      total,
      limit,
      skip,
    };
  }

  private mapInvoice(doc: InvoiceDocument) {
    return {
      id: doc._id.toString(),
      businessId: doc.businessId,
      invoiceNumber: doc.invoiceNumber,
      status: doc.status,
      customerId: doc.customerId,
      customerSnapshot: doc.customerSnapshot,
      businessSnapshot: doc.businessSnapshot,
      issueDate: doc.issueDate,
      dueDate: doc.dueDate,
      isInterState: doc.isInterState,
      items: doc.items,
      subtotalMinor: doc.subtotalMinor,
      totalDiscountMinor: doc.totalDiscountMinor,
      totalTaxableAmountMinor: doc.totalTaxableAmountMinor,
      cgstMinor: doc.cgstMinor,
      sgstMinor: doc.sgstMinor,
      igstMinor: doc.igstMinor,
      totalTaxMinor: doc.totalTaxMinor,
      roundOffMinor: doc.roundOffMinor,
      grandTotalMinor: doc.grandTotalMinor,
      paidAmountMinor: doc.paidAmountMinor,
      dueAmountMinor: doc.dueAmountMinor,
      notes: doc.notes,
      terms: doc.terms,
      cancelReason: doc.cancelReason,
      cancelledAt: doc.cancelledAt,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
