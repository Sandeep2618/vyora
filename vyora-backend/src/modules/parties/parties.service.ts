import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Party, PartyDocument } from './schemas/party.schema';
import { PartyInput } from '@vyora/validation';
import { PartyType } from '@vyora/shared-types';

@Injectable()
export class PartiesService {
  constructor(
    @InjectModel(Party.name)
    private readonly partyModel: Model<PartyDocument>,
  ) {}

  async create(businessId: string, dto: PartyInput) {
    const party = new this.partyModel({
      businessId,
      ...dto,
      currentBalanceMinor: dto.openingBalanceMinor || 0,
      isArchived: false,
    });
    await party.save();
    return this.mapParty(party);
  }

  async update(businessId: string, id: string, dto: PartyInput) {
    const party = await this.partyModel.findOne({ _id: id, businessId });
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    Object.assign(party, dto);
    await party.save();
    return this.mapParty(party);
  }

  async findOne(businessId: string, id: string) {
    const party = await this.partyModel.findOne({ _id: id, businessId });
    if (!party) {
      throw new NotFoundException('Party not found');
    }
    return this.mapParty(party);
  }

  async findAll(
    businessId: string,
    query: {
      type?: PartyType;
      search?: string;
      limit?: number;
      skip?: number;
    },
  ) {
    const filter: any = { businessId, isArchived: false };

    if (query.type) {
      filter.$or = [{ type: query.type }, { type: 'BOTH' }];
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }, { gstin: regex }];
    }

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [items, total] = await Promise.all([
      this.partyModel.find(filter).sort({ name: 1 }).limit(limit).skip(skip),
      this.partyModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => this.mapParty(p)),
      total,
      limit,
      skip,
    };
  }

  async updateBalance(businessId: string, partyId: string, deltaMinor: number) {
    return this.partyModel.findOneAndUpdate(
      { _id: partyId, businessId },
      { $inc: { currentBalanceMinor: deltaMinor } },
      { new: true },
    );
  }

  async delete(businessId: string, id: string) {
    const party = await this.partyModel.findOne({ _id: id, businessId });
    if (!party) {
      throw new NotFoundException('Party not found');
    }
    party.isArchived = true;
    await party.save();
    return { success: true, message: 'Party deleted successfully' };
  }

  async archive(businessId: string, id: string) {
    return this.delete(businessId, id);
  }

  private mapParty(doc: PartyDocument) {
    return {
      id: doc._id.toString(),
      businessId: doc.businessId,
      type: doc.type,
      name: doc.name,
      contactPerson: doc.contactPerson,
      phone: doc.phone,
      email: doc.email,
      gstin: doc.gstin,
      pan: doc.pan,
      billingAddress: doc.billingAddress,
      shippingAddress: doc.shippingAddress,
      openingBalanceMinor: doc.openingBalanceMinor,
      currentBalanceMinor: doc.currentBalanceMinor,
      creditLimitMinor: doc.creditLimitMinor,
      isArchived: doc.isArchived,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };
  }
}
