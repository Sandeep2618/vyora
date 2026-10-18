import { PaymentModel, IPayment } from '../model';
import { InvoiceModel } from '../../invoices/model';
import { PurchaseBillModel } from '../../purchases/model';
import { PartyModel } from '../../parties/model';
import { PartiesService } from '../../parties/service';
import { AuditService } from '../../audit/service';
import { NotFoundError, BadRequestError } from '../../../util';
import { CreatePaymentInput } from '../validator';
import { formatDocumentNumber } from '@vyora/utils';

export class PaymentsService {
  static async create(
    businessId: string,
    dto: CreatePaymentInput,
    userId: string,
    userName: string,
  ) {
    // 1. Idempotency Check: prevent duplicate submission
    if (dto.idempotencyKey) {
      const existing = await PaymentModel.findOne({
        businessId,
        idempotencyKey: dto.idempotencyKey,
      });
      if (existing) {
        return this.mapPayment(existing);
      }
    }

    const party = await PartyModel.findOne({ _id: dto.partyId, businessId });
    if (!party) {
      throw new NotFoundError('Party');
    }

    // 2. Handle invoice allocation if specified
    if (dto.invoiceId) {
      const invoice = await InvoiceModel.findOne({ _id: dto.invoiceId, businessId });
      if (!invoice) {
        throw new NotFoundError('Associated invoice');
      }

      if (invoice.status === 'DRAFT') {
        throw new BadRequestError('Cannot record payment against a draft invoice. Please finalize first.');
      }

      if (invoice.status === 'CANCELLED') {
        throw new BadRequestError('Cannot record payment against a cancelled invoice.');
      }

      if (dto.amountMinor > invoice.dueAmountMinor) {
        throw new BadRequestError(
          `Payment amount (${dto.amountMinor / 100}) exceeds outstanding invoice due (${invoice.dueAmountMinor / 100})`,
        );
      }

      invoice.paidAmountMinor += dto.amountMinor;
      invoice.dueAmountMinor -= dto.amountMinor;
      invoice.status = invoice.dueAmountMinor === 0 ? 'PAID' : 'PARTIAL';
      await invoice.save();
    } else if (dto.type === 'RECEIPT') {
      // FIFO auto-allocation: settle oldest open customer invoices with receipt amount
      const openInvoices = await InvoiceModel.find({
        businessId,
        customerId: party._id.toString(),
        dueAmountMinor: { $gt: 0 },
        status: { $nin: ['DRAFT', 'CANCELLED'] },
      }).sort({ issueDate: 1, createdAt: 1 });

      let remaining = dto.amountMinor;
      for (const inv of openInvoices) {
        if (remaining <= 0) break;
        const alloc = Math.min(remaining, inv.dueAmountMinor);
        inv.paidAmountMinor += alloc;
        inv.dueAmountMinor -= alloc;
        inv.status = inv.dueAmountMinor === 0 ? 'PAID' : 'PARTIAL';
        await inv.save();
        remaining -= alloc;
      }
    }

    // 3. Handle purchase bill allocation if specified or FIFO
    if (dto.purchaseBillId) {
      const purchase = await PurchaseBillModel.findOne({ _id: dto.purchaseBillId, businessId });
      if (!purchase) {
        throw new NotFoundError('Associated purchase bill');
      }

      if (dto.amountMinor > purchase.dueAmountMinor) {
        throw new BadRequestError('Payment amount exceeds outstanding purchase bill due');
      }

      purchase.paidAmountMinor += dto.amountMinor;
      purchase.dueAmountMinor -= dto.amountMinor;
      purchase.status = purchase.dueAmountMinor === 0 ? 'PAID' : 'PARTIAL';
      await purchase.save();
    } else if (dto.type === 'PAYMENT') {
      // FIFO auto-allocation: settle oldest open supplier purchase bills with payment amount
      const openPurchases = await PurchaseBillModel.find({
        businessId,
        supplierId: party._id.toString(),
        dueAmountMinor: { $gt: 0 },
      }).sort({ billDate: 1, createdAt: 1 });

      let remaining = dto.amountMinor;
      for (const pur of openPurchases) {
        if (remaining <= 0) break;
        const alloc = Math.min(remaining, pur.dueAmountMinor);
        pur.paidAmountMinor += alloc;
        pur.dueAmountMinor -= alloc;
        pur.status = pur.dueAmountMinor === 0 ? 'PAID' : 'PARTIAL';
        await pur.save();
        remaining -= alloc;
      }
    }

    // 4. Update Party Balance
    if (dto.type === 'RECEIPT') {
      // Customer payment reduces receivable
      await PartiesService.updateBalance(businessId, dto.partyId, -dto.amountMinor);
    } else {
      // Payment to supplier reduces payable (increases balance toward zero)
      await PartiesService.updateBalance(businessId, dto.partyId, dto.amountMinor);
    }

    // Generate unique payment voucher number
    const count = await PaymentModel.countDocuments({ businessId });
    const prefix = dto.type === 'RECEIPT' ? 'RCPT-' : 'PAY-';
    const paymentNumber = formatDocumentNumber(prefix, count + 1, 4);

    const payment = new PaymentModel({
      businessId,
      paymentNumber,
      type: dto.type,
      partyId: party._id.toString(),
      partyName: party.name,
      invoiceId: dto.invoiceId,
      purchaseBillId: dto.purchaseBillId,
      amountMinor: dto.amountMinor,
      paymentMethod: dto.paymentMethod,
      referenceNumber: dto.referenceNumber,
      paymentDate: dto.paymentDate,
      notes: dto.notes,
      idempotencyKey: dto.idempotencyKey,
      receivedByUserId: userId,
    });

    await payment.save();

    await AuditService.logAction({
      businessId,
      userId,
      userName,
      action: dto.type === 'RECEIPT' ? 'PAYMENT_RECEIPT' : 'SUPPLIER_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment._id.toString(),
      details: {
        paymentNumber,
        amountMinor: dto.amountMinor,
        partyName: party.name,
        invoiceId: dto.invoiceId,
      },
    });

    return this.mapPayment(payment);
  }

  static async findAll(
    businessId: string,
    query: {
      partyId?: string;
      invoiceId?: string;
      limit?: number;
      skip?: number;
    },
  ) {
    const filter: any = { businessId };
    if (query.partyId) filter.partyId = query.partyId;
    if (query.invoiceId) filter.invoiceId = query.invoiceId;

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [items, total] = await Promise.all([
      PaymentModel.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip),
      PaymentModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => this.mapPayment(p)),
      total,
      limit,
      skip,
    };
  }

  static async findOne(businessId: string, id: string) {
    const payment = await PaymentModel.findOne({ _id: id, businessId });
    if (!payment) {
      throw new NotFoundError('Payment record');
    }
    return this.mapPayment(payment);
  }

  static mapPayment(doc: IPayment) {
    return {
      id: doc._id.toString(),
      businessId: doc.businessId,
      paymentNumber: doc.paymentNumber,
      type: doc.type,
      partyId: doc.partyId,
      partyName: doc.partyName,
      invoiceId: doc.invoiceId,
      purchaseBillId: doc.purchaseBillId,
      amountMinor: doc.amountMinor,
      paymentMethod: doc.paymentMethod,
      referenceNumber: doc.referenceNumber,
      paymentDate: doc.paymentDate,
      notes: doc.notes,
      idempotencyKey: doc.idempotencyKey,
      receivedByUserId: doc.receivedByUserId,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }

  static async getExportData(
    businessId: string,
    query: {
      type?: string;
      partyId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ) {
    const filter: any = { businessId };
    if (query.type) filter.type = query.type;
    if (query.partyId) filter.partyId = query.partyId;
    if (query.startDate || query.endDate) {
      filter.paymentDate = {};
      if (query.startDate) filter.paymentDate.$gte = query.startDate;
      if (query.endDate) filter.paymentDate.$lte = query.endDate;
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { paymentNumber: regex },
        { partyName: regex },
        { referenceNumber: regex },
        { notes: regex },
      ];
    }

    return PaymentModel.find(filter).sort({ paymentDate: -1, createdAt: -1 }).lean();
  }
}
