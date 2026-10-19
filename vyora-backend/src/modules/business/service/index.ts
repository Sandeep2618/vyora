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
import { MailService } from '../../mail/mail.service';

export class BusinessService {
  static async getBusinessById(businessId: string) {
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business');
    }
    const ownerUser = business.ownerUserId
      ? await UserModel.findById(business.ownerUserId).select('name phone').lean()
      : null;
    return this.mapBusiness(business, ownerUser as any);
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
    const ownerUser = business.ownerUserId
      ? await UserModel.findById(business.ownerUserId).select('name phone').lean()
      : null;
    return this.mapBusiness(business, ownerUser as any);
  }

  static async updateSubscriptionPlan(businessId: string, plan: SubscriptionPlan) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const updated = await BusinessModel.findByIdAndUpdate(
      businessId,
      {
        subscriptionPlan: plan,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: (plan === 'starter' || plan === 'free') ? undefined : oneYearFromNow,
      },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundError('Business');
    }
    const ownerUser = updated.ownerUserId
      ? await UserModel.findById(updated.ownerUserId).select('name phone').lean()
      : null;
    return this.mapBusiness(updated, ownerUser as any);
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
    const ownerUser = business.ownerUserId
      ? await UserModel.findById(business.ownerUserId).select('name phone').lean()
      : null;
    return this.mapBusiness(business, ownerUser as any);
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
    inviterName?: string,
  ) {
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business');
    }

    if (business.subscriptionPlan === 'starter' || (business.subscriptionPlan as string) === 'free') {
      throw new ForbiddenError(
        'Adding team members is not available on the Free Starter plan. Upgrade to the Growth plan to invite staff.',
        'PlanLimitExceeded',
        {
          requiredPlan: 'growth',
          currentPlan: 'starter',
          isOwner: true,
        },
      );
    }

    if (business.subscriptionPlan === 'growth') {
      const activeStaffCount = await MembershipModel.countDocuments({
        businessId,
        isActive: { $ne: false },
      });
      // Growth plan allows up to 5 staff members (including owner: 6 total)
      if (activeStaffCount >= 6) {
        throw new ForbiddenError(
          'Growth plan is limited to 5 team members. Upgrade to Business Pro for unlimited staff.',
          'PlanLimitExceeded',
          {
            requiredPlan: 'enterprise',
            currentPlan: 'growth',
            isOwner: true,
          },
        );
      }
    }

    let isNewUser = false;
    let user = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      isNewUser = true;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('VyoraStaff@123', salt);
      user = new UserModel({
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        defaultBusinessId: businessId,
        isInvited: true,
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
      status: 'ACTIVE',
      invitedBy: inviterName || 'The Business Owner',
    });
    await membership.save();

    // Trigger invitation email asynchronously
    MailService.sendStaffInviteEmail({
      to: data.email.toLowerCase(),
      name: data.name || user.name,
      businessName: business.name || 'Vyora Workspace',
      businessId,
      inviterName: inviterName || 'The Business Owner',
      role: data.role,
      tempPassword: isNewUser ? 'VyoraStaff@123' : undefined,
    }).catch(() => {});

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

  static async createBusiness(
    userId: string,
    currentBusinessId: string | undefined,
    dto: {
      name: string;
      phone?: string;
      email?: string;
      addressLine1?: string;
      city?: string;
      state?: string;
      stateCode?: string;
      pincode?: string;
      gstin?: string;
      currency?: string;
      invoicePrefix?: string;
    },
  ) {
    if (!dto.name || !dto.name.trim()) {
      throw new ConflictError('Store or business name is required');
    }

    const cleanPhone = (dto.phone || '').trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      throw new ConflictError('A valid 10-digit store mobile number is required');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    let userPlan: SubscriptionPlan = 'starter';
    let subStatus = 'active';
    let subExpiresAt: Date | undefined;

    if (currentBusinessId) {
      const curBiz = await BusinessModel.findById(currentBusinessId);
      if (curBiz) {
        userPlan = (curBiz.subscriptionPlan as SubscriptionPlan) || 'starter';
        subStatus = (curBiz as any).subscriptionStatus || 'active';
        subExpiresAt = (curBiz as any).subscriptionExpiresAt;
      }
    } else {
      const existingOwned = await BusinessModel.findOne({ ownerUserId: userId });
      if (existingOwned) {
        userPlan = (existingOwned.subscriptionPlan as SubscriptionPlan) || 'starter';
        subStatus = (existingOwned as any).subscriptionStatus || 'active';
        subExpiresAt = (existingOwned as any).subscriptionExpiresAt;
      }
    }

    const ownedCount = await BusinessModel.countDocuments({ ownerUserId: userId });

    if ((userPlan === 'starter' || (userPlan as string) === 'free') && ownedCount >= 1) {
      throw new ForbiddenError(
        'The Free Starter plan allows 1 store only. Please upgrade to Growth or Enterprise to add more stores.',
        'PlanLimitExceeded',
        {
          currentPlan: 'starter',
          allowedStores: 1,
          currentStores: ownedCount,
        },
      );
    }

    if (userPlan === 'growth' && ownedCount >= 3) {
      throw new ForbiddenError(
        'The Growth plan allows up to 3 stores. Upgrade to Enterprise for unlimited stores.',
        'PlanLimitExceeded',
        {
          currentPlan: 'growth',
          allowedStores: 3,
          currentStores: ownedCount,
        },
      );
    }

    const newBusiness = new BusinessModel({
      name: dto.name.trim(),
      phone: cleanPhone,
      email: dto.email?.trim() || user.email || '',
      addressLine1: dto.addressLine1?.trim() || '',
      city: dto.city?.trim() || '',
      state: dto.state?.trim() || '',
      stateCode: dto.stateCode?.trim() || '',
      pincode: dto.pincode?.trim() || '',
      gstin: dto.gstin?.trim() || undefined,
      currency: dto.currency || 'INR',
      invoicePrefix: dto.invoicePrefix?.trim() || 'INV-',
      invoiceNumberPadding: 4,
      nextInvoiceNumber: 1,
      purchasePrefix: 'BILL-',
      nextPurchaseNumber: 1,
      ownerUserId: user._id.toString(),
      subscriptionPlan: userPlan,
      subscriptionStatus: subStatus,
      subscriptionExpiresAt: subExpiresAt,
    });
    await newBusiness.save();

    const membership = new MembershipModel({
      userId: user._id.toString(),
      businessId: newBusiness._id.toString(),
      role: 'OWNER',
      isActive: true,
      status: 'ACTIVE',
      permissions: [
        'POS_CREATE_INVOICE',
        'POS_VIEW_INVOICES',
        'INVENTORY_VIEW',
        'INVENTORY_EDIT',
        'PARTY_VIEW',
        'PARTY_EDIT',
        'REPORTS_VIEW',
        'SETTINGS_EDIT',
        'STAFF_MANAGE',
      ],
    });
    await membership.save();

    return this.mapBusiness(newBusiness, user as any);
  }

  private static mapBusiness(business: IBusiness, ownerUser?: { name: string; phone?: string }) {
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
      upiId: (business as any).upiId || '',
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
      subscriptionStatus: (business as any).subscriptionStatus || 'active',
      subscriptionExpiresAt: (business as any).subscriptionExpiresAt,
      ownerName: ownerUser?.name || 'Store Owner',
      ownerPhone: ownerUser?.phone || business.phone,
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
