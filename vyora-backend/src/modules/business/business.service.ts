import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
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
      subscriptionPlan: business.subscriptionPlan || 'growth',
      createdAt: (business as any).createdAt,
      updatedAt: (business as any).updatedAt,
    };
  }

  async getStaff(businessId: string) {
    const [memberships, business] = await Promise.all([
      this.membershipModel.find({ businessId }),
      this.businessModel.findById(businessId),
    ]);
    const userIds = memberships.map((m) => m.userId);
    const users = await this.userModel.find({ _id: { $in: userIds } });

    return memberships.map((m) => {
      const u = users.find((user) => user._id.toString() === m.userId);
      const isPrimaryOwner = Boolean(business && business.ownerUserId === m.userId);
      return {
        id: m._id.toString(),
        userId: m.userId,
        name: u?.name || 'Unknown',
        email: u?.email || 'Unknown',
        role: m.role,
        isPrimaryOwner,
        isActive: m.isActive !== false,
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

  async updateStaffRole(
    businessId: string,
    membershipId: string,
    newRole: UserRole,
    currentUserId?: string,
  ) {
    const [membership, business] = await Promise.all([
      this.membershipModel.findOne({ _id: membershipId, businessId }),
      this.businessModel.findById(businessId),
    ]);
    if (!membership) {
      throw new NotFoundException('Team member not found in this business');
    }

    const isTargetPrimaryOwner = Boolean(business && business.ownerUserId === membership.userId);
    const isCallerPrimaryOwner = Boolean(business && business.ownerUserId === currentUserId);

    // Rule 1: The real/primary business owner can NEVER have their role altered or demoted
    if (isTargetPrimaryOwner) {
      throw new ForbiddenException('The primary business owner permissions cannot be altered or demoted.');
    }

    // Rule 2: If caller is a promoted owner (not the real owner), they cannot change any other owner's role
    if (!isCallerPrimaryOwner && membership.role === 'OWNER') {
      throw new ForbiddenException('Only the primary business owner has permission to change or demote owner roles.');
    }

    // Rule 3: Protection against zero active owners
    if (membership.role === 'OWNER' && newRole === 'STAFF') {
      const ownerCount = await this.membershipModel.countDocuments({
        businessId,
        role: 'OWNER',
        isActive: true,
      });
      if (ownerCount <= 1) {
        throw new ConflictException('Cannot demote the last remaining owner. Assign another owner first.');
      }
    }

    membership.role = newRole;
    await membership.save();

    await this.userModel.findByIdAndUpdate(membership.userId, { role: newRole });

    return {
      id: membership._id.toString(),
      userId: membership.userId,
      role: membership.role,
      isPrimaryOwner: false,
      isActive: membership.isActive !== false,
    };
  }

  async toggleStaffStatus(
    businessId: string,
    membershipId: string,
    isActive: boolean,
    currentUserId?: string,
  ) {
    const [membership, business] = await Promise.all([
      this.membershipModel.findOne({ _id: membershipId, businessId }),
      this.businessModel.findById(businessId),
    ]);
    if (!membership) {
      throw new NotFoundException('Team member not found in this business');
    }

    const isTargetPrimaryOwner = Boolean(business && business.ownerUserId === membership.userId);
    const isCallerPrimaryOwner = Boolean(business && business.ownerUserId === currentUserId);

    // Primary owner cannot be suspended
    if (isTargetPrimaryOwner) {
      throw new ForbiddenException('The primary business owner account cannot be deactivated.');
    }

    // Promoted owners cannot deactivate other owners
    if (!isCallerPrimaryOwner && membership.role === 'OWNER') {
      throw new ForbiddenException('Only the primary business owner can deactivate an owner account.');
    }

    if (!isActive && membership.role === 'OWNER') {
      const activeOwners = await this.membershipModel.countDocuments({
        businessId,
        role: 'OWNER',
        isActive: true,
      });
      if (activeOwners <= 1) {
        throw new ConflictException('Cannot deactivate the last active owner.');
      }
    }

    membership.isActive = isActive;
    await membership.save();

    return {
      id: membership._id.toString(),
      isActive: membership.isActive,
    };
  }

  async removeStaffMember(
    businessId: string,
    membershipId: string,
    currentUserId?: string,
  ) {
    const [membership, business] = await Promise.all([
      this.membershipModel.findOne({ _id: membershipId, businessId }),
      this.businessModel.findById(businessId),
    ]);
    if (!membership) {
      throw new NotFoundException('Team member not found');
    }

    const isTargetPrimaryOwner = Boolean(business && business.ownerUserId === membership.userId);
    const isCallerPrimaryOwner = Boolean(business && business.ownerUserId === currentUserId);

    if (isTargetPrimaryOwner) {
      throw new ForbiddenException('The primary business owner cannot be removed.');
    }

    if (!isCallerPrimaryOwner && membership.role === 'OWNER') {
      throw new ForbiddenException('Only the primary business owner can remove an owner account.');
    }

    if (membership.role === 'OWNER') {
      const activeOwners = await this.membershipModel.countDocuments({
        businessId,
        role: 'OWNER',
      });
      if (activeOwners <= 1) {
        throw new ConflictException('Cannot remove the primary business owner.');
      }
    }

    await this.membershipModel.findByIdAndDelete(membershipId);
    return { success: true };
  }

  async updateSubscriptionPlan(businessId: string, plan: 'starter' | 'growth' | 'enterprise') {
    const updated = await this.businessModel.findByIdAndUpdate(
      businessId,
      { subscriptionPlan: plan },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Business not found');
    }
    return this.mapBusiness(updated);
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
