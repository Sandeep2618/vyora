import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../model';
import { BusinessModel, MembershipModel } from '../../business/model';
import { PartyModel } from '../../parties/model';
import { config } from '../../../config';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../../../util';
import {
  RegisterInput,
  LoginInput,
  SendOtpInput,
  VerifyOtpInput,
  SelectContextInput,
} from '../validator';
import { AuthTokens, UserProfile, UserPersonas } from '@vyora/shared-types';

export class AuthService {
  private static otpStore = new Map<string, { otp: string; expiresAt: number }>();

  static async register(dto: RegisterInput): Promise<AuthTokens> {
    const existing = await UserModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = new UserModel({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: 'OWNER',
      roles: ['OWNER'],
    });
    await user.save();

    const businessName = dto.businessName || `${dto.name}'s Business`;
    const business = new BusinessModel({
      name: businessName,
      phone: '9876543210',
      email: dto.email.toLowerCase(),
      addressLine1: 'Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400001',
      currency: 'INR',
      invoicePrefix: 'INV-',
      invoiceNumberPadding: 4,
      nextInvoiceNumber: 1,
      purchasePrefix: 'BILL-',
      nextPurchaseNumber: 1,
      ownerUserId: user._id.toString(),
    });
    await business.save();

    const membership = new MembershipModel({
      userId: user._id.toString(),
      businessId: business._id.toString(),
      role: 'OWNER',
      permissions: [
        'POS_CREATE_INVOICE',
        'INVENTORY_VIEW_STOCK',
        'INVENTORY_ADJUST_STOCK',
        'REPORTS_VIEW',
        'PURCHASES_MANAGE',
      ],
    });
    await membership.save();

    user.defaultBusinessId = business._id.toString();
    await user.save();

    return this.generateTokens(user, business._id.toString());
  }

  static async login(dto: LoginInput): Promise<AuthTokens> {
    const user = await UserModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    let businessId = user.defaultBusinessId?.toString();
    if (!businessId) {
      const membership = await MembershipModel.findOne({ userId: user._id.toString() });
      if (membership) {
        businessId = membership.businessId.toString();
        user.defaultBusinessId = businessId;
        await user.save();
      }
    }

    return this.generateTokens(user, businessId);
  }

  static async sendOtp(dto: SendOtpInput): Promise<{ success: boolean; message: string; devOtp?: string }> {
    const cleanPhone = dto.phone.trim();
    const demoOtp = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000;
    this.otpStore.set(cleanPhone, { otp: demoOtp, expiresAt });

    return {
      success: true,
      message: 'OTP sent successfully',
      devOtp: demoOtp,
    };
  }

  static async verifyOtp(dto: VerifyOtpInput): Promise<AuthTokens> {
    const cleanPhone = dto.phone.trim();
    const cleanOtp = dto.otp.trim();

    const cached = this.otpStore.get(cleanPhone);
    const isDevMaster = cleanOtp === '123456';
    const isCachedValid = cached && cached.otp === cleanOtp && cached.expiresAt > Date.now();

    if (!isDevMaster && !isCachedValid) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }

    if (cached) {
      this.otpStore.delete(cleanPhone);
    }

    let user = await UserModel.findOne({ phone: cleanPhone });
    if (!user) {
      user = new UserModel({
        name: dto.name || `Customer ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        phoneVerified: true,
        role: 'CUSTOMER',
        roles: ['CUSTOMER'],
      });
      await user.save();
    } else {
      user.phoneVerified = true;
      if (!user.roles || user.roles.length === 0) {
        user.roles = [user.role || 'CUSTOMER'];
      }
      if (!user.roles.includes('CUSTOMER')) {
        user.roles.push('CUSTOMER');
      }
      if (dto.name && (!user.name || user.name.startsWith('Customer '))) {
        user.name = dto.name;
      }
      await user.save();
    }

    if (!user.defaultBusinessId) {
      const parties = await PartyModel.find({
        phone: cleanPhone,
        type: { $in: ['CUSTOMER', 'BOTH'] },
        isArchived: { $ne: true },
      });
      if (parties.length > 0) {
        user.defaultBusinessId = parties[0].businessId;
        await user.save();
      }
    }

    return this.generateTokens(user, user.defaultBusinessId?.toString());
  }

  static async getPersonas(userId: string): Promise<UserPersonas> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const memberships = await MembershipModel.find({ userId: user._id.toString(), isActive: true });
    const ownedBusinessesDirect = await BusinessModel.find({ ownerUserId: user._id.toString() });

    const ownerBizIdsFromMemberships = memberships
      .filter((m) => m.role === 'OWNER')
      .map((m) => m.businessId);

    const allOwnedBizIds = Array.from(
      new Set([
        ...ownedBusinessesDirect.map((b) => b._id.toString()),
        ...ownerBizIdsFromMemberships,
      ]),
    );

    const ownedBizDocs = await BusinessModel.find({ _id: { $in: allOwnedBizIds } });
    const ownedBusinesses = ownedBizDocs.map((b) => ({
      id: b._id.toString(),
      name: b.name,
      role: 'OWNER' as const,
    }));

    const staffMemberships = memberships.filter((m) => m.role === 'STAFF');
    const staffBizIds = staffMemberships.map((m) => m.businessId);
    const staffBizDocs = await BusinessModel.find({ _id: { $in: staffBizIds } });
    const staffBizMap = new Map(staffBizDocs.map((b) => [b._id.toString(), b.name]));

    const staffBusinesses = staffMemberships.map((m) => ({
      id: m.businessId,
      name: staffBizMap.get(m.businessId) || 'Business',
      role: 'STAFF' as const,
      permissions: m.permissions || [],
    }));

    const customerShops: Array<{ businessId: string; shopName: string; shopPhone?: string; balanceMinor: number }> = [];
    if (user.phone) {
      const customerParties = await PartyModel.find({
        phone: user.phone,
        type: { $in: ['CUSTOMER', 'BOTH'] },
        isArchived: { $ne: true },
      });

      if (customerParties.length > 0) {
        const shopIds = Array.from(new Set(customerParties.map((p) => p.businessId)));
        const shops = await BusinessModel.find({ _id: { $in: shopIds } });
        const shopMap = new Map(shops.map((s) => [s._id.toString(), s]));

        for (const party of customerParties) {
          const shop = shopMap.get(party.businessId);
          if (shop) {
            customerShops.push({
              businessId: party.businessId,
              shopName: shop.name,
              shopPhone: shop.phone,
              balanceMinor: party.currentBalanceMinor || 0,
            });
          }
        }
      }
    }

    return {
      userId: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      activeRole: user.role,
      activeBusinessId: user.defaultBusinessId?.toString(),
      ownedBusinesses,
      staffBusinesses,
      customerShops,
    };
  }

  static async selectContext(userId: string, dto: SelectContextInput): Promise<AuthTokens> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (dto.contextType === 'OWNER') {
      if (dto.businessId) {
        const isOwner =
          (await BusinessModel.findOne({ _id: dto.businessId, ownerUserId: user._id.toString() })) ||
          (await MembershipModel.findOne({
            userId: user._id.toString(),
            businessId: dto.businessId,
            role: 'OWNER',
            isActive: true,
          }));

        if (!isOwner) {
          throw new UnauthorizedError('Not authorized as OWNER for this business');
        }
        user.role = 'OWNER';
        user.defaultBusinessId = dto.businessId;
      } else {
        const owned = await BusinessModel.findOne({ ownerUserId: user._id.toString() });
        user.role = 'OWNER';
        if (owned) {
          user.defaultBusinessId = owned._id.toString();
        }
      }
    } else if (dto.contextType === 'STAFF') {
      if (!dto.businessId) {
        throw new BadRequestError('businessId is required when selecting STAFF context');
      }
      const membership = await MembershipModel.findOne({
        userId: user._id.toString(),
        businessId: dto.businessId,
        role: 'STAFF',
        isActive: true,
      });

      if (!membership) {
        throw new UnauthorizedError('Not authorized as STAFF for this business');
      }
      user.role = 'STAFF';
      user.defaultBusinessId = dto.businessId;
    } else if (dto.contextType === 'CUSTOMER') {
      user.role = 'CUSTOMER';
      if (dto.businessId) {
        user.defaultBusinessId = dto.businessId;
      }
    }

    await user.save();
    return this.generateTokens(user, user.defaultBusinessId?.toString());
  }

  static async getProfile(userId: string): Promise<UserProfile> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: user._id.toString(),
      email: user.email || '',
      phone: user.phone,
      name: user.name,
      role: user.role,
      businessId: user.defaultBusinessId?.toString(),
      createdAt: (user as any).createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  private static generateTokens(user: IUser, businessId?: string): AuthTokens {
    const payload = {
      sub: user._id.toString(),
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      businessId,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email || '',
        phone: user.phone,
        name: user.name,
        role: user.role,
        businessId,
        createdAt: (user as any).createdAt?.toISOString() || new Date().toISOString(),
      },
    };
  }
}
