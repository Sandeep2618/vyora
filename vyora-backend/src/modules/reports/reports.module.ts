import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema';
import { PurchaseBill, PurchaseBillSchema } from '../purchases/schemas/purchase.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Party, PartySchema } from '../parties/schemas/party.schema';
import { ExpenseRecord, ExpenseRecordSchema } from '../expenses/schemas/expense.schema';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: PurchaseBill.name, schema: PurchaseBillSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Party.name, schema: PartySchema },
      { name: ExpenseRecord.name, schema: ExpenseRecordSchema },
    ]),
    BusinessModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
