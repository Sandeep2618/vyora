import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PurchaseBill, PurchaseBillSchema } from './schemas/purchase.schema';
import { Party, PartySchema } from '../parties/schemas/party.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { BusinessModule } from '../business/business.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PartiesModule } from '../parties/parties.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseBill.name, schema: PurchaseBillSchema },
      { name: Party.name, schema: PartySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    BusinessModule,
    InventoryModule,
    PartiesModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService, MongooseModule],
})
export class PurchasesModule {}
