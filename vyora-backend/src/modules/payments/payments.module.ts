import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema';
import { PurchaseBill, PurchaseBillSchema } from '../purchases/schemas/purchase.schema';
import { Party, PartySchema } from '../parties/schemas/party.schema';
import { BusinessModule } from '../business/business.module';
import { PartiesModule } from '../parties/parties.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: PurchaseBill.name, schema: PurchaseBillSchema },
      { name: Party.name, schema: PartySchema },
    ]),
    BusinessModule,
    PartiesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, MongooseModule],
})
export class PaymentsModule {}
