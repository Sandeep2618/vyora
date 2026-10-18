import { PartyModel, IParty } from '../model';
import { BusinessModel } from '../../business/model';
import { NotFoundError } from '../../../util';
import { PartyInput } from '@vyora/validation';
import { PartyType } from '@vyora/shared-types';

export class PartiesService {
  static async create(businessId: string, dto: PartyInput) {
    const business = await BusinessModel.findById(businessId).lean();

    // Place of Supply for walk-in / counter sales strictly inherits the store's physical state
    const state = dto.billingAddress?.state?.trim() || business?.state?.trim() || '';
    const stateCode = dto.billingAddress?.stateCode?.trim() || business?.stateCode?.trim() || '';
    const billingAddress = {
      line1: dto.billingAddress?.line1 || business?.addressLine1 || '',
      line2: dto.billingAddress?.line2 || business?.addressLine2 || '',
      city: dto.billingAddress?.city || business?.city || '',
      state,
      stateCode,
      pincode: dto.billingAddress?.pincode || business?.pincode || '',
    };

    const isWalkIn = Boolean(dto.isWalkIn || dto.name.toLowerCase().includes('walk-in'));

    const party = new PartyModel({
      businessId,
      ...dto,
      phone: dto.phone?.trim() || '',
      isWalkIn,
      billingAddress,
      currentBalanceMinor: dto.openingBalanceMinor || 0,
      isArchived: false,
    });
    await party.save();
    return this.mapParty(party);
  }

  static async update(businessId: string, id: string, dto: PartyInput) {
    const party = await PartyModel.findOne({ _id: id, businessId });
    if (!party) {
      throw new NotFoundError('Party');
    }

    Object.assign(party, dto);
    await party.save();
    return this.mapParty(party);
  }

  static async findOne(businessId: string, id: string) {
    const party = await PartyModel.findOne({ _id: id, businessId });
    if (!party) {
      throw new NotFoundError('Party');
    }
    return this.mapParty(party);
  }

  static async findAll(
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
      PartyModel.find(filter).sort({ name: 1 }).limit(limit).skip(skip),
      PartyModel.countDocuments(filter),
    ]);

    return {
      items: items.map((p) => this.mapParty(p)),
      total,
      limit,
      skip,
    };
  }

  static async updateBalance(businessId: string, partyId: string, deltaMinor: number) {
    return PartyModel.findOneAndUpdate(
      { _id: partyId, businessId },
      { $inc: { currentBalanceMinor: deltaMinor } },
      { new: true },
    );
  }

  static async delete(businessId: string, id: string) {
    const party = await PartyModel.findOne({ _id: id, businessId });
    if (!party) {
      throw new NotFoundError('Party');
    }
    party.isArchived = true;
    await party.save();
    return { success: true, message: 'Party deleted successfully' };
  }

  private static mapParty(party: IParty) {
    return {
      id: party._id.toString(),
      _id: party._id.toString(),
      businessId: party.businessId,
      type: party.type,
      name: party.name,
      contactPerson: party.contactPerson,
      phone: party.phone,
      isWalkIn: party.isWalkIn || false,
      email: party.email,
      gstin: party.gstin,
      pan: party.pan,
      billingAddress: party.billingAddress,
      shippingAddress: party.shippingAddress,
      openingBalanceMinor: party.openingBalanceMinor,
      currentBalanceMinor: party.currentBalanceMinor,
      creditLimitMinor: party.creditLimitMinor,
      isArchived: party.isArchived,
      createdAt: (party as any).createdAt,
      updatedAt: (party as any).updatedAt,
    };
  }

  static async getExportData(
    businessId: string,
    query: {
      type?: PartyType | 'ALL';
      search?: string;
    },
  ) {
    const filter: any = { businessId, isArchived: false };
    if (query.type && query.type !== 'ALL') {
      filter.$or = [{ type: query.type }, { type: 'BOTH' }];
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { email: regex }, { gstin: regex }];
    }

    return PartyModel.find(filter).sort({ name: 1 }).lean();
  }
}
