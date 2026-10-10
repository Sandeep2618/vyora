import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { Party, PartySchema } from '../parties/schemas/party.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { BusinessModule } from '../business/business.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PartiesModule } from '../parties/parties.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Party.name, schema: PartySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    BusinessModule,
    InventoryModule,
    PartiesModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService, MongooseModule],
})
export class InvoicesModule {}
