import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { PurchaseBill, PurchaseBillDocument } from '../purchases/schemas/purchase.schema';
import { Party, PartyDocument } from '../parties/schemas/party.schema';
import { PartiesService } from '../parties/parties.service';
import { AuditService } from '../audit/audit.service';
import { CreatePaymentInput } from '@vyora/validation';
import { formatDocumentNumber } from '@vyora/utils';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(PurchaseBill.name)
    private readonly purchaseModel: Model<PurchaseBillDocument>,
    @InjectModel(Party.name)
    private readonly partyModel: Model<PartyDocument>,
    private readonly partiesService: PartiesService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    businessId: string,
    dto: CreatePaymentInput,
    userId: string,
    userName: string,
  ) {
    // 1. Idempotency Check: prevent duplicate submission
    if (dto.idempotencyKey) {
      const existing = await this.paymentModel.findOne({
        businessId,
        idempotencyKey: dto.idempotencyKey,
      });
      if (existing) {
        return this.mapPayment(existing);
      }
    }

    const party = await this.partyModel.findOne({ _id: dto.partyId, businessId });
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    // 2. Handle invoice allocation if specified
    if (dto.invoiceId) {
      const invoice = await this.invoiceModel.findOne({ _id: dto.invoiceId, businessId });
      if (!invoice) {
        throw new NotFoundException('Associated invoice not found');
      }

      if (invoice.status === 'DRAFT') {
        throw new BadRequestException('Cannot record payment against a draft invoice. Please finalize first.');
      }

      if (invoice.status === 'CANCELLED') {
        throw new BadRequestException('Cannot record payment against a cancelled invoice.');
      }

      if (dto.amountMinor > invoice.dueAmountMinor) {
        throw new BadRequestException(
          `Payment amount (${dto.amountMinor / 100}) exceeds outstanding invoice due (${invoice.dueAmountMinor / 100})`,
        );
      }

      invoice.paidAmountMinor += dto.amountMinor;
      invoice.dueAmountMinor -= dto.amountMinor;
      invoice.status = invoice.dueAmountMinor === 0 ? 'PAID' : 'PARTIAL';
      await invoice.save();
    }

    // 3. Handle purchase bill allocation if specified
    if (dto.purchaseBillId) {
      const purchase = await this.purchaseModel.findOne({ _id: dto.purchaseBillId, businessId });
      if (!purchase) {
        throw new NotFoundException('Associated purchase bill not found');
      }

      if (dto.amountMinor > purchase.dueAmountMinor) {
        throw new BadRequestException(
          `Payment amount exceeds outstanding purchase bill due`,
        );
      }

      purchase.paidAmountMinor += dto.amountMinor;
      purchase.dueAmountMinor -= dto.amountMinor;
      purchase.status = purchase.dueAmountMinor === 0 ? 'PAID' : 'PARTIAL';
      await purchase.save();
    }

    // 4. Update Party Balance
    if (dto.type === 'RECEIPT') {
      // Customer payment reduces receivable
      await this.partiesService.updateBalance(businessId, dto.partyId, -dto.amountMinor);
    } else {
      // Payment to supplier reduces payable (increases balance toward zero)
      await this.partiesService.updateBalance(businessId, dto.partyId, dto.amountMinor);
    }

    // Generate unique payment voucher number
    const count = await this.paymentModel.countDocuments({ businessId });
    const prefix = dto.type === 'RECEIPT' ? 'RCPT-' : 'PAY-';
    const paymentNumber = formatDocumentNumber(prefix, count + 1, 4);

    const payment = new this.paymentModel({
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

    await this.auditService.logAction({
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

  async findAll(
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
      this.paymentModel.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip),
      this.paymentModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => this.mapPayment(p)),
      total,
      limit,
      skip,
    };
  }

  async findOne(businessId: string, id: string) {
    const payment = await this.paymentModel.findOne({ _id: id, businessId });
    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }
    return this.mapPayment(payment);
  }

  private mapPayment(doc: PaymentDocument) {
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
}
