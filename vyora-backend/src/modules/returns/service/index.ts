import { CreditNoteModel, DebitNoteModel, IReturnItemSnapshot } from '../model';
import { InvoiceModel } from '../../invoices/model';
import { PurchaseBillModel } from '../../purchases/model';
import { ProductModel } from '../../products/model';
import { PartiesService } from '../../parties/service';
import { InventoryService } from '../../inventory/service';
import { CreateReturnInput } from '@vyora/validation';
import { NotFoundError, BadRequestError } from '../../../util';
import { calculateLineItem } from '@vyora/utils';

export class ReturnsService {
  /**
   * Record a Sales Return (Credit Note) against an existing invoice
   */
  static async createCreditNote(
    businessId: string,
    invoiceId: string,
    dto: CreateReturnInput,
    userId?: string,
  ) {
    const invoice = await InvoiceModel.findOne({ _id: invoiceId, businessId });
    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    if (invoice.status === 'DRAFT') {
      throw new BadRequestError('Cannot process returns on an unfinalized draft invoice');
    }

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestError('Cannot process returns on a cancelled invoice');
    }

    // Previous returns against this invoice
    const existingCreditNotes = await CreditNoteModel.find({ businessId, invoiceId });
    const returnedQtyMap = new Map<string, number>();
    for (const cn of existingCreditNotes) {
      for (const it of cn.items) {
        returnedQtyMap.set(it.productId, (returnedQtyMap.get(it.productId) || 0) + it.quantity);
      }
    }

    const returnSnapshots: IReturnItemSnapshot[] = [];
    let subtotalMinor = 0;
    let totalTaxMinor = 0;
    let grandTotalMinor = 0;

    for (const reqItem of dto.items) {
      const origLine = invoice.items.find((l) => l.productId === reqItem.productId);
      if (!origLine) {
        throw new BadRequestError(`Item ${reqItem.productId} was not part of original invoice`);
      }

      const alreadyReturned = returnedQtyMap.get(reqItem.productId) || 0;
      const maxReturnable = origLine.quantity - alreadyReturned;
      if (reqItem.quantity > maxReturnable) {
        throw new BadRequestError(
          `Cannot return ${reqItem.quantity} of "${origLine.productName}". Maximum returnable is ${maxReturnable}.`,
        );
      }

      const calculated = calculateLineItem(
        {
          productId: origLine.productId,
          productName: origLine.productName,
          sku: origLine.sku,
          hsnCode: origLine.hsnCode,
          unit: origLine.unit,
          quantity: reqItem.quantity,
          unitPriceMinor: origLine.unitPriceMinor,
          taxRatePercent: origLine.taxRatePercent,
        },
        invoice.isInterState,
      );

      returnSnapshots.push({
        productId: calculated.productId,
        productName: calculated.productName,
        sku: calculated.sku,
        hsnCode: calculated.hsnCode,
        unit: calculated.unit,
        quantity: calculated.quantity,
        unitPriceMinor: calculated.unitPriceMinor,
        taxRatePercent: calculated.taxRatePercent,
        taxableAmountMinor: calculated.taxableAmountMinor,
        cgstMinor: calculated.cgstMinor,
        sgstMinor: calculated.sgstMinor,
        igstMinor: calculated.igstMinor,
        totalMinor: calculated.lineTotalMinor,
      });

      subtotalMinor += calculated.taxableAmountMinor;
      totalTaxMinor += calculated.totalTaxMinor;
      grandTotalMinor += calculated.lineTotalMinor;
    }

    // Generate unique Credit Note number
    const count = await CreditNoteModel.countDocuments({ businessId });
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(4, '0');
    const creditNoteNumber = `CN-${year}-${seq}`;

    // 1. Atomically restock inventory
    for (const item of returnSnapshots) {
      await ProductModel.findOneAndUpdate(
        { _id: item.productId, businessId },
        { $inc: { currentStock: item.quantity } },
      );
      try {
        await InventoryService.recordMovement({
          businessId,
          productId: item.productId,
          movementType: 'RETURN',
          quantityDelta: item.quantity,
          referenceType: 'CREDIT_NOTE',
          referenceId: invoice._id.toString(),
          reason: `Sales return ${creditNoteNumber} for Invoice ${invoice.invoiceNumber}`,
        } as any);
      } catch (e) {
        // Ignored
      }
    }

    // 2. Adjust invoice due amount if invoice has an outstanding balance
    if (invoice.dueAmountMinor > 0) {
      const reduction = Math.min(invoice.dueAmountMinor, grandTotalMinor);
      invoice.dueAmountMinor = Math.max(0, invoice.dueAmountMinor - reduction);
      if (invoice.dueAmountMinor === 0) {
        invoice.status = 'PAID';
      }
      await invoice.save();
    }

    // 3. Settle / credit customer balance ledger
    await PartiesService.updateBalance(businessId, invoice.customerId, -grandTotalMinor);

    // 4. Save Credit Note record
    const creditNote = new CreditNoteModel({
      businessId,
      creditNoteNumber,
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerSnapshot?.name || 'Customer',
      issueDate: dto.issueDate || new Date().toISOString().split('T')[0],
      reason: dto.reason,
      items: returnSnapshots,
      subtotalMinor,
      totalTaxMinor,
      grandTotalMinor,
      createdByUserId: userId,
    });

    await creditNote.save();
    return creditNote;
  }

  /**
   * Record a Purchase Return (Debit Note) against an existing supplier bill
   */
  static async createDebitNote(
    businessId: string,
    purchaseBillId: string,
    dto: CreateReturnInput,
    userId?: string,
  ) {
    const purchase = await PurchaseBillModel.findOne({ _id: purchaseBillId, businessId });
    if (!purchase) {
      throw new NotFoundError('Purchase Bill');
    }

    const returnSnapshots: IReturnItemSnapshot[] = [];
    let subtotalMinor = 0;
    let totalTaxMinor = 0;
    let grandTotalMinor = 0;

    for (const reqItem of dto.items) {
      const origLine = purchase.items.find((l) => l.productId === reqItem.productId);
      if (!origLine) {
        throw new BadRequestError(`Item ${reqItem.productId} was not part of purchase bill`);
      }

      if (reqItem.quantity > origLine.quantity) {
        throw new BadRequestError(
          `Cannot return ${reqItem.quantity}. Maximum purchased was ${origLine.quantity}.`,
        );
      }

      const calculated = calculateLineItem(
        {
          productId: origLine.productId,
          productName: origLine.productName,
          sku: origLine.sku,
          unit: origLine.unit || 'PCS',
          quantity: reqItem.quantity,
          unitPriceMinor: origLine.unitPriceMinor,
          taxRatePercent: origLine.taxRatePercent || 0,
        },
        false,
      );

      returnSnapshots.push({
        productId: calculated.productId,
        productName: calculated.productName,
        sku: calculated.sku,
        unit: calculated.unit,
        quantity: calculated.quantity,
        unitPriceMinor: calculated.unitPriceMinor,
        taxRatePercent: calculated.taxRatePercent,
        taxableAmountMinor: calculated.taxableAmountMinor,
        cgstMinor: calculated.cgstMinor,
        sgstMinor: calculated.sgstMinor,
        igstMinor: 0,
        totalMinor: calculated.lineTotalMinor,
      });

      subtotalMinor += calculated.taxableAmountMinor;
      totalTaxMinor += calculated.totalTaxMinor;
      grandTotalMinor += calculated.lineTotalMinor;
    }

    const count = await DebitNoteModel.countDocuments({ businessId });
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(4, '0');
    const debitNoteNumber = `DN-${year}-${seq}`;

    // 1. Atomically deduct physical inventory
    for (const item of returnSnapshots) {
      await ProductModel.findOneAndUpdate(
        { _id: item.productId, businessId },
        { $inc: { currentStock: -item.quantity } },
      );
    }

    // 2. Adjust purchase bill due
    if (purchase.dueAmountMinor > 0) {
      const reduction = Math.min(purchase.dueAmountMinor, grandTotalMinor);
      purchase.dueAmountMinor = Math.max(0, purchase.dueAmountMinor - reduction);
      if (purchase.dueAmountMinor === 0) {
        purchase.status = 'PAID';
      }
      await purchase.save();
    }

    // 3. Settle supplier ledger balance (reduces payable)
    await PartiesService.updateBalance(businessId, purchase.supplierId, -grandTotalMinor);

    const debitNote = new DebitNoteModel({
      businessId,
      debitNoteNumber,
      purchaseBillId: purchase._id.toString(),
      billNumber: purchase.billNumber,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierSnapshot?.name || 'Supplier',
      issueDate: dto.issueDate || new Date().toISOString().split('T')[0],
      reason: dto.reason,
      items: returnSnapshots,
      subtotalMinor,
      totalTaxMinor,
      grandTotalMinor,
      createdByUserId: userId,
    });

    await debitNote.save();
    return debitNote;
  }

  static async getInvoiceCreditNotes(businessId: string, invoiceId: string) {
    return CreditNoteModel.find({ businessId, invoiceId }).sort({ createdAt: -1 });
  }

  static async getPurchaseDebitNotes(businessId: string, purchaseBillId: string) {
    return DebitNoteModel.find({ businessId, purchaseBillId }).sort({ createdAt: -1 });
  }
}
