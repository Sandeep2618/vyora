import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Business, BusinessDocument } from './schemas/business.schema';
import { Membership, MembershipDocument } from './schemas/membership.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { BusinessProfileInput } from '@vyora/validation';
import { UserRole } from '@vyora/shared-types';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(Membership.name)
    private readonly membershipModel: Model<MembershipDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getBusinessById(businessId: string) {
    const business = await this.businessModel.findById(businessId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return this.mapBusiness(business);
  }

  async updateBusiness(businessId: string, dto: BusinessProfileInput) {
    const business = await this.businessModel.findByIdAndUpdate(
      businessId,
      {
        ...dto,
      },
      { new: true },
    );
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return this.mapBusiness(business);
  }

  private mapBusiness(business: BusinessDocument) {
    return {
      id: business._id.toString(),
      _id: business._id.toString(),
      name: business.name,
      legalName: business.legalName,
      phone: business.phone,
      email: business.email,
      gstin: business.gstin,
      pan: business.pan,
      addressLine1: business.addressLine1,
      addressLine2: business.addressLine2,
      city: business.city,
      state: business.state,
      stateCode: business.stateCode,
      pincode: business.pincode,
      currency: business.currency,
      invoicePrefix: business.invoicePrefix,
      invoiceNumberPadding: business.invoiceNumberPadding,
      nextInvoiceNumber: business.nextInvoiceNumber,
      purchasePrefix: business.purchasePrefix,
      nextPurchaseNumber: business.nextPurchaseNumber,
      termsAndConditions: business.termsAndConditions,
      createdAt: (business as any).createdAt,
      updatedAt: (business as any).updatedAt,
    };
  }

  async getStaff(businessId: string) {
    const memberships = await this.membershipModel.find({ businessId });
    const userIds = memberships.map((m) => m.userId);
    const users = await this.userModel.find({ _id: { $in: userIds } });

    return memberships.map((m) => {
      const u = users.find((user) => user._id.toString() === m.userId);
      return {
        id: m._id.toString(),
        userId: m.userId,
        name: u?.name || 'Unknown',
        email: u?.email || 'Unknown',
        role: m.role,
        createdAt: (m as any).createdAt,
      };
    });
  }

  async addStaffMember(
    businessId: string,
    data: { name: string; email: string; role: UserRole },
  ) {
    let user = await this.userModel.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      // Create user with temporary password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('VyoraStaff@123', salt);
      user = new this.userModel({
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        defaultBusinessId: businessId,
      });
      await user.save();
    }

    const existingMembership = await this.membershipModel.findOne({
      userId: user._id.toString(),
      businessId,
    });
    if (existingMembership) {
      throw new ConflictException('User is already a member of this business');
    }

    const membership = new this.membershipModel({
      userId: user._id.toString(),
      businessId,
      role: data.role,
    });
    await membership.save();

    return {
      id: membership._id.toString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: membership.role,
    };
  }

  /**
   * Atomically acquires and increments the next invoice number
   */
  async acquireNextInvoiceNumber(businessId: string): Promise<number> {
    const updated = await this.businessModel.findByIdAndUpdate(
      businessId,
      { $inc: { nextInvoiceNumber: 1 } },
      { new: false, returnDocument: 'before' }, // returns the current sequence before increment
    );
    if (!updated) {
      throw new NotFoundException('Business not found');
    }
    return updated.nextInvoiceNumber || 1;
  }

  /**
   * Atomically acquires and increments the next purchase bill number
   */
  async acquireNextPurchaseNumber(businessId: string): Promise<number> {
    const updated = await this.businessModel.findByIdAndUpdate(
      businessId,
      { $inc: { nextPurchaseNumber: 1 } },
      { new: false, returnDocument: 'before' },
    );
    if (!updated) {
      throw new NotFoundException('Business not found');
    }
    return updated.nextPurchaseNumber || 1;
  }
}
