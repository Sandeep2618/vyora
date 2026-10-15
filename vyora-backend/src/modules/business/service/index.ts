import bcrypt from 'bcryptjs';
import { BusinessModel, IBusiness, MembershipModel, IMembership } from '../model';
import { UserModel } from '../../auth/model';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../../../util';
import { BusinessProfileInput } from '@vyora/validation';
import { UserRole, SubscriptionPlan } from '@vyora/shared-types';

export class BusinessService {
  static async getBusinessById(businessId: string) {
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business');
    }
    return this.mapBusiness(business);
  }

  static async updateBusiness(businessId: string, dto: BusinessProfileInput) {
    const business = await BusinessModel.findByIdAndUpdate(
      businessId,
      { ...dto },
      { new: true },
    );
    if (!business) {
      throw new NotFoundError('Business');
    }
    return this.mapBusiness(business);
  }

  static async updateStaffPermissions(businessId: string, permissions: Record<string, boolean>) {
    const business = await BusinessModel.findByIdAndUpdate(
      businessId,
      { $set: { staffPermissions: permissions } },
      { new: true },
    );
    if (!business) {
      throw new NotFoundError('Business');
    }
    return this.mapBusiness(business);
  }

  static async updateSubscriptionPlan(businessId: string, plan: SubscriptionPlan) {
    const updated = await BusinessModel.findByIdAndUpdate(
      businessId,
      { subscriptionPlan: plan },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundError('Business');
    }
    return this.mapBusiness(updated);
  }

  static async getStaff(businessId: string) {
    const [memberships, business] = await Promise.all([
      MembershipModel.find({ businessId }),
      BusinessModel.findById(businessId),
    ]);
    const userIds = memberships.map((m) => m.userId);
    const users = await UserModel.find({ _id: { $in: userIds } });

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

  static async addStaffMember(
    businessId: string,
    data: { name: string; email: string; role: UserRole },
  ) {
    let user = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('VyoraStaff@123', salt);
      user = new UserModel({
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        roles: [data.role],
        defaultBusinessId: businessId,
      });
      await user.save();
    }

    const existingMembership = await MembershipModel.findOne({
      userId: user._id.toString(),
      businessId,
    });
    if (existingMembership) {
      throw new ConflictError('User is already a member of this business');
    }

    const membership = new MembershipModel({
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

  static async updateStaffRole(
    businessId: string,
    membershipId: string,
    newRole: UserRole,
    currentUserId?: string,
  ) {
    const [membership, business] = await Promise.all([
      MembershipModel.findOne({ _id: membershipId, businessId }),
      BusinessModel.findById(businessId),
    ]);
    if (!membership) {
      throw new NotFoundError('Team member in this business');
    }

    const isTargetPrimaryOwner = Boolean(business && business.ownerUserId === membership.userId);
    const isCallerPrimaryOwner = Boolean(business && business.ownerUserId === currentUserId);

    if (isTargetPrimaryOwner) {
      throw new ForbiddenError('The primary business owner permissions cannot be altered or demoted.');
    }

    if (!isCallerPrimaryOwner && membership.role === 'OWNER') {
      throw new ForbiddenError('Only the primary business owner has permission to change or demote owner roles.');
    }

    if (membership.role === 'OWNER' && newRole === 'STAFF') {
      const hasOtherPermanentOwner = Boolean(
        business && business.ownerUserId && business.ownerUserId !== membership.userId,
      );
      if (!hasOtherPermanentOwner) {
        const ownerCount = await MembershipModel.countDocuments({
          businessId,
          role: 'OWNER',
          isActive: { $ne: false },
        });
        if (ownerCount <= 1) {
          throw new ConflictError('Cannot demote the last remaining owner. Assign another owner first.');
        }
      }
    }

    membership.role = newRole;
    await membership.save();

    await UserModel.findByIdAndUpdate(membership.userId, { role: newRole });

    return {
      id: membership._id.toString(),
      userId: membership.userId,
      role: membership.role,
      isPrimaryOwner: false,
      isActive: membership.isActive !== false,
    };
  }

  static async toggleStaffStatus(
    businessId: string,
    membershipId: string,
    isActive: boolean,
    currentUserId?: string,
  ) {
    const [membership, business] = await Promise.all([
      MembershipModel.findOne({ _id: membershipId, businessId }),
      BusinessModel.findById(businessId),
    ]);
    if (!membership) {
      throw new NotFoundError('Team member in this business');
    }

    const isTargetPrimaryOwner = Boolean(business && business.ownerUserId === membership.userId);
    const isCallerPrimaryOwner = Boolean(business && business.ownerUserId === currentUserId);

    if (isTargetPrimaryOwner) {
      throw new ForbiddenError('The primary business owner account cannot be deactivated.');
    }

    if (!isCallerPrimaryOwner && membership.role === 'OWNER') {
      throw new ForbiddenError('Only the primary business owner can deactivate an owner account.');
    }

    if (!isActive && membership.role === 'OWNER') {
      const hasOtherPermanentOwner = Boolean(
        business && business.ownerUserId && business.ownerUserId !== membership.userId,
      );
      if (!hasOtherPermanentOwner) {
        const activeOwners = await MembershipModel.countDocuments({
          businessId,
          role: 'OWNER',
          isActive: { $ne: false },
        });
        if (activeOwners <= 1) {
          throw new ConflictError('Cannot deactivate the last active owner.');
        }
      }
    }

    membership.isActive = isActive;
    await membership.save();

    return {
      id: membership._id.toString(),
      isActive: membership.isActive,
    };
  }

  static async removeStaffMember(
    businessId: string,
    membershipId: string,
    currentUserId?: string,
  ) {
    const [membership, business] = await Promise.all([
      MembershipModel.findOne({ _id: membershipId, businessId }),
      BusinessModel.findById(businessId),
    ]);
    if (!membership) {
      throw new NotFoundError('Team member');
    }

    const isTargetPrimaryOwner = Boolean(business && business.ownerUserId === membership.userId);
    const isCallerPrimaryOwner = Boolean(business && business.ownerUserId === currentUserId);

    if (isTargetPrimaryOwner) {
      throw new ForbiddenError('The primary business owner cannot be removed.');
    }

    if (!isCallerPrimaryOwner && membership.role === 'OWNER') {
      throw new ForbiddenError('Only the primary business owner can remove an owner account.');
    }

    if (membership.role === 'OWNER') {
      const hasOtherPermanentOwner = Boolean(
        business && business.ownerUserId && business.ownerUserId !== membership.userId,
      );
      if (!hasOtherPermanentOwner) {
        const activeOwners = await MembershipModel.countDocuments({
          businessId,
          role: 'OWNER',
        });
        if (activeOwners <= 1) {
          throw new ConflictError('Cannot remove the primary business owner.');
        }
      }
    }

    await MembershipModel.findByIdAndDelete(membershipId);
    return { success: true };
  }

  static async acquireNextInvoiceNumber(businessId: string): Promise<number> {
    const updated = await BusinessModel.findByIdAndUpdate(
      businessId,
      { $inc: { nextInvoiceNumber: 1 } },
      { new: false, returnDocument: 'before' },
    );
    if (!updated) {
      throw new NotFoundError('Business');
    }
    return updated.nextInvoiceNumber || 1;
  }

  static async acquireNextPurchaseNumber(businessId: string): Promise<number> {
    const updated = await BusinessModel.findByIdAndUpdate(
      businessId,
      { $inc: { nextPurchaseNumber: 1 } },
      { new: false, returnDocument: 'before' },
    );
    if (!updated) {
      throw new NotFoundError('Business');
    }
    return updated.nextPurchaseNumber || 1;
  }

  private static mapBusiness(business: IBusiness) {
    return {
      id: business._id.toString(),
      _id: business._id.toString(),
      name: business.name,
      legalName: business.legalName,
      logoUrl: (business as any).logoUrl,
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
      staffPermissions: (business as any).staffPermissions || {
        invoices: true,
        parties: true,
        products: true,
        inventory: true,
        purchases: true,
        payments: true,
        reports: false,
      },
      createdAt: (business as any).createdAt,
      updatedAt: (business as any).updatedAt,
    };
  }
}
