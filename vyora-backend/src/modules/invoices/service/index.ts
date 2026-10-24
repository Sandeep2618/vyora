import { InvoiceModel, IInvoice } from '../model';
import { PaymentModel } from '../../payments/model';
import { PartyModel } from '../../parties/model';
import { ProductModel } from '../../products/model';
import { BusinessService } from '../../business/service';
import { InventoryService } from '../../inventory/service';
import { PartiesService } from '../../parties/service';
import { AuditService } from '../../audit/service';
import { NotFoundError, BadRequestError } from '../../../util';
import { CreateInvoiceInput, CancelInvoiceInput } from '@vyora/validation';
import {
  calculateLineItem,
  calculateInvoiceTotals,
  formatDocumentNumber,
} from '@vyora/utils';
import { InvoiceStatus } from '@vyora/shared-types';
import {
  buildBusinessSnapshot,
  buildCustomerSnapshot,
  mapInvoiceDocument,
} from '../util';

export class InvoicesService {
  static async calculateAndBuildInvoiceData(businessId: string, dto: CreateInvoiceInput) {
    const [business, customer] = await Promise.all([
      BusinessService.getBusinessById(businessId),
      PartyModel.findOne({ _id: dto.customerId, businessId }),
    ]);

    if (!customer) {
      throw new NotFoundError('Selected customer');
    }

    const customerState =
      customer.billingAddress?.state?.trim().toLowerCase() ||
      business.state.trim().toLowerCase();
    const isInterState =
      dto.isInterState !== undefined
        ? dto.isInterState
        : business.state.trim().toLowerCase() !== customerState;

    const productIds = dto.items.map((i) => i.productId);
    const products = await ProductModel.find({
      _id: { $in: productIds },
      businessId,
    });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const calculatedLines = dto.items.map((item) => {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new NotFoundError(`Product ${item.productId} in business catalog`);
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

  static async previewInvoice(businessId: string, dto: CreateInvoiceInput) {
    const { business, customer, isInterState, calculatedLines, totals } =
      await this.calculateAndBuildInvoiceData(businessId, dto);

    return {
      businessSnapshot: buildBusinessSnapshot(business),
      customerSnapshot: buildCustomerSnapshot(customer),
      isInterState,
      items: calculatedLines,
      ...totals,
    };
  }

  static async create(
    businessId: string,
    dto: CreateInvoiceInput,
    userId: string,
    finalizeImmediately: boolean = false,
  ) {
    const { business, customer, isInterState, calculatedLines, totals } =
      await this.calculateAndBuildInvoiceData(businessId, dto);

    const shouldFinalize = Boolean(dto.finalize ?? finalizeImmediately);

    if (shouldFinalize) {
      for (const line of calculatedLines) {
        const prod = await ProductModel.findOne({ _id: line.productId, businessId });
        if (!prod || prod.currentStock < line.quantity) {
          throw new BadRequestError(
            `Insufficient stock for "${line.productName}" (SKU: ${line.sku}). Available: ${prod?.currentStock || 0}, Required: ${line.quantity}`,
          );
        }
      }
    }

    let invoiceNumber: string;
    let status: InvoiceStatus = 'DRAFT';
    let paidAmountMinor = 0;
    let dueAmountMinor = totals.grandTotalMinor;

    if (shouldFinalize) {
      const nextSeq = await BusinessService.acquireNextInvoiceNumber(businessId);
      invoiceNumber = formatDocumentNumber(
        business.invoicePrefix || 'INV-',
        nextSeq,
        business.invoiceNumberPadding || 4,
      );

      if (dto.paymentMethod) {
        paidAmountMinor =
          dto.paidAmountMinor !== undefined
            ? Math.min(dto.paidAmountMinor, totals.grandTotalMinor)
            : totals.grandTotalMinor;
        dueAmountMinor = totals.grandTotalMinor - paidAmountMinor;
        status = dueAmountMinor === 0 ? 'PAID' : (paidAmountMinor > 0 ? 'PARTIAL' : 'UNPAID');
      } else {
        status = 'UNPAID';
      }
    } else {
      invoiceNumber = `DRAFT-${Date.now().toString().slice(-6)}`;
    }

    const invoice = new InvoiceModel({
      businessId,
      invoiceNumber,
      status,
      customerId: customer._id.toString(),
      customerSnapshot: buildCustomerSnapshot(customer),
      businessSnapshot: buildBusinessSnapshot(business),
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
      paidAmountMinor,
      dueAmountMinor,
      notes: dto.notes,
      terms: dto.terms || business.termsAndConditions,
      createdByUserId: userId,
    });

    await invoice.save();

    if (shouldFinalize) {
      for (const line of calculatedLines) {
        await InventoryService.recordMovement({
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

      // Update party ledger: increase by grand total, decrease by paid amount
      const balanceDelta = totals.grandTotalMinor - paidAmountMinor;
      if (balanceDelta !== 0) {
        await PartiesService.updateBalance(
          businessId,
          customer._id.toString(),
          balanceDelta,
        );
      }

      // If immediate payment was collected, record official Payment receipt voucher
      if (paidAmountMinor > 0 && dto.paymentMethod) {
        const paymentCount = await PaymentModel.countDocuments({ businessId });
        const paymentNumber = formatDocumentNumber('RCPT-', paymentCount + 1, 4);
        await PaymentModel.create({
          businessId,
          paymentNumber,
          type: 'RECEIPT',
          partyId: customer._id.toString(),
          partyName: customer.name,
          invoiceId: invoice._id.toString(),
          amountMinor: paidAmountMinor,
          paymentMethod: dto.paymentMethod,
          paymentDate: dto.issueDate || new Date().toISOString().split('T')[0],
          referenceNumber: `${dto.paymentMethod}-${invoiceNumber}`,
          notes: `Instant ${dto.paymentMethod} Settlement for Invoice #${invoiceNumber}`,
          idempotencyKey: `auto-${invoice._id.toString()}-${Date.now()}`,
          receivedByUserId: userId,
        });
      }

      await AuditService.logAction({
        businessId,
        userId,
        userName: 'User',
        action: 'FINALIZED',
        entityType: 'INVOICE',
        entityId: invoice._id.toString(),
        details: { invoiceNumber, grandTotalMinor: totals.grandTotalMinor, paidAmountMinor },
      });
    }

    return mapInvoiceDocument(invoice);
  }

  static async finalizeInvoice(businessId: string, id: string, userId: string) {
    const invoice = await InvoiceModel.findOne({ _id: id, businessId });
    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestError(`Cannot finalize an invoice in "${invoice.status}" status`);
    }

    const business = await BusinessService.getBusinessById(businessId);

    for (const item of invoice.items) {
      const prod = await ProductModel.findOne({ _id: item.productId, businessId });
      if (!prod || prod.currentStock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for "${item.productName}" (SKU: ${item.sku}). Available: ${prod?.currentStock || 0}, Required: ${item.quantity}`,
        );
      }
    }

    const nextSeq = await BusinessService.acquireNextInvoiceNumber(businessId);
    invoice.invoiceNumber = formatDocumentNumber(
      business.invoicePrefix || 'INV-',
      nextSeq,
      business.invoiceNumberPadding || 4,
    );
    invoice.status = 'UNPAID';
    await invoice.save();

    for (const item of invoice.items) {
      await InventoryService.recordMovement({
        businessId,
        productId: item.productId,
        quantityDelta: -item.quantity,
        movementType: 'SALE',
        referenceType: 'INVOICE',
        referenceId: invoice._id.toString(),
        reason: `Sale Invoice ${invoice.invoiceNumber}`,
        performedByUserId: userId,
        allowNegative: false,
      });
    }

    await PartiesService.updateBalance(
      businessId,
      invoice.customerId,
      invoice.grandTotalMinor,
    );

    await AuditService.logAction({
      businessId,
      userId,
      userName: 'User',
      action: 'FINALIZED',
      entityType: 'INVOICE',
      entityId: invoice._id.toString(),
      details: { invoiceNumber: invoice.invoiceNumber, grandTotalMinor: invoice.grandTotalMinor },
    });

    return mapInvoiceDocument(invoice);
  }

  static async cancelInvoice(
    businessId: string,
    id: string,
    dto: CancelInvoiceInput,
    userId: string,
  ) {
    const invoice = await InvoiceModel.findOne({ _id: id, businessId });
    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestError('Invoice is already cancelled');
    }

    if (invoice.paidAmountMinor > 0) {
      throw new BadRequestError(
        'Cannot cancel an invoice with recorded payments. Please void associated payments first.',
      );
    }

    const previousStatus = invoice.status;
    invoice.status = 'CANCELLED';
    invoice.cancelReason = dto.reason;
    invoice.cancelledAt = new Date().toISOString();
    invoice.cancelledByUserId = userId;
    await invoice.save();

    if (previousStatus !== 'DRAFT') {
      for (const item of invoice.items) {
        await InventoryService.recordMovement({
          businessId,
          productId: item.productId,
          quantityDelta: item.quantity,
          movementType: 'ADJUSTMENT',
          referenceType: 'INVOICE',
          referenceId: invoice._id.toString(),
          reason: `Cancelled Invoice ${invoice.invoiceNumber} reversal: ${dto.reason}`,
          performedByUserId: userId,
          allowNegative: true,
        });
      }

      await PartiesService.updateBalance(
        businessId,
        invoice.customerId,
        -invoice.dueAmountMinor,
      );
    }

    await AuditService.logAction({
      businessId,
      userId,
      userName: 'User',
      action: 'CANCELLED',
      entityType: 'INVOICE',
      entityId: invoice._id.toString(),
      details: { invoiceNumber: invoice.invoiceNumber, reason: dto.reason },
    });

    return mapInvoiceDocument(invoice);
  }

  static async findAll(
    businessId: string,
    query: {
      customerId?: string;
      status?: InvoiceStatus;
      startDate?: string;
      endDate?: string;
      limit?: number;
      skip?: number;
    },
  ) {
    const filter: any = { businessId, isDeleted: { $ne: true } };
    if (query.customerId) filter.customerId = query.customerId;
    if (query.status) filter.status = query.status;
    if (query.startDate || query.endDate) {
      filter.issueDate = {};
      if (query.startDate) filter.issueDate.$gte = query.startDate;
      if (query.endDate) filter.issueDate.$lte = query.endDate;
    }

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [items, total] = await Promise.all([
      InvoiceModel.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip),
      InvoiceModel.countDocuments(filter),
    ]);

    return {
      items: items.map((doc) => mapInvoiceDocument(doc)),
      total,
      limit,
      skip,
    };
  }

  static async findOne(businessId: string, id: string) {
    const invoice = await InvoiceModel.findOne({ _id: id, businessId, isDeleted: { $ne: true } });
    if (!invoice) {
      throw new NotFoundError('Invoice');
    }
    return mapInvoiceDocument(invoice);
  }

  static async softDelete(businessId: string, id: string, userId?: string, reason?: string) {
    const invoice = await InvoiceModel.findOneAndUpdate(
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
    if (!invoice) {
      throw new NotFoundError('Invoice');
    }
    return { success: true, message: 'Invoice moved to Recycle Bin' };
  }

  static async recordPayment(
    businessId: string,
    invoiceId: string,
    paidDeltaMinor: number,
  ) {
    const invoice = await InvoiceModel.findOne({ _id: invoiceId, businessId });
    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    invoice.paidAmountMinor += paidDeltaMinor;
    invoice.dueAmountMinor = Math.max(0, invoice.grandTotalMinor - invoice.paidAmountMinor);

    if (invoice.dueAmountMinor === 0) {
      invoice.status = 'PAID';
    } else if (invoice.paidAmountMinor > 0) {
      invoice.status = 'PARTIAL';
    } else {
      invoice.status = 'UNPAID';
    }

    await invoice.save();
    return mapInvoiceDocument(invoice);
  }

  static async getExportData(
    businessId: string,
    query: {
      customerId?: string;
      status?: InvoiceStatus;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ) {
    const filter: any = { businessId, isDeleted: { $ne: true } };
    if (query.customerId) filter.customerId = query.customerId;
    if (query.status) filter.status = query.status;
    if (query.startDate || query.endDate) {
      filter.issueDate = {};
      if (query.startDate) filter.issueDate.$gte = query.startDate;
      if (query.endDate) filter.issueDate.$lte = query.endDate;
    }
    if (query.search) {
      filter.$or = [
        { invoiceNumber: { $regex: query.search, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: query.search, $options: 'i' } },
        { 'customerSnapshot.phone': { $regex: query.search, $options: 'i' } },
      ];
    }

    return InvoiceModel.find(filter).sort({ issueDate: -1, createdAt: -1 }).lean();
  }
}
