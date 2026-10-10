import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartiesService } from './parties.service';
import { PartiesController } from './parties.controller';
import { Party, PartySchema } from './schemas/party.schema';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Party.name, schema: PartySchema }]),
    BusinessModule,
  ],
  controllers: [PartiesController],
  providers: [PartiesService],
  exports: [PartiesService, MongooseModule],
})
export class PartiesModule {}
