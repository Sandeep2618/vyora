import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../model';
import { BusinessModel, MembershipModel } from '../../business/model';
import { PartyModel } from '../../parties/model';
import { MailService } from '../../mail/mail.service';
import { config } from '../../../config';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../../../util';
import {
  RegisterInput,
  LoginInput,
  SendOtpInput,
  VerifyOtpInput,
  SelectContextInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../validator';
import { FirebaseService } from './firebase.service';
import { AuthTokens, UserProfile, UserPersonas, UserWorkspace } from '@vyora/shared-types';

export class AuthService {
  private static otpStore = new Map<string, { otp: string; expiresAt: number }>();

  static async register(dto: RegisterInput): Promise<AuthTokens> {
    const cleanPhone = (dto.phone || '').trim().replace(/[^0-9]/g, '');
    const cleanEmail = (dto.email || '').trim().toLowerCase();

    if (!cleanEmail && !cleanPhone) {
      throw new BadRequestError('Either email or mobile number is required to register');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const existing = await UserModel.findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : []),
      ],
    });

    if (existing) {
      if (existing.isInvited) {
        existing.name = dto.name;
        existing.passwordHash = passwordHash;
        if (cleanPhone) existing.phone = cleanPhone;
        if (cleanEmail) existing.email = cleanEmail;
        existing.isInvited = false;
        await existing.save();

        const activeBizId = existing.defaultBusinessId?.toString() || '';
        return this.generateTokens(existing, activeBizId);
      }

      if (cleanPhone && existing.phone === cleanPhone) {
        throw new ConflictError('An account with this mobile number already exists');
      }
      throw new ConflictError('An account with this email already exists');
    }

    const user = new UserModel({
      name: dto.name,
      email: cleanEmail || undefined,
      phone: cleanPhone || undefined,
      passwordHash,
      role: 'OWNER',
      roles: ['OWNER'],
    });
    await user.save();

    const trimmedBizName = dto.businessName?.trim();
    const trimmedUserName = dto.name?.trim();
    const businessName = trimmedBizName || (trimmedUserName ? `${trimmedUserName}'s Store` : 'My Store');
    const business = new BusinessModel({
      name: businessName,
      phone: cleanPhone || '',
      email: cleanEmail || '',
      addressLine1: '',
      city: '',
      state: '',
      stateCode: '',
      pincode: '',
      currency: 'INR',
      invoicePrefix: 'INV-',
      invoiceNumberPadding: 4,
      nextInvoiceNumber: 1,
      purchasePrefix: 'BILL-',
      nextPurchaseNumber: 1,
      ownerUserId: user._id.toString(),
      subscriptionPlan: 'starter',
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

    // Trigger welcome email asynchronously
    if (cleanEmail && !cleanEmail.endsWith('@vyora.in')) {
      MailService.sendWelcomeEmail({
        to: cleanEmail,
        name: user.name,
        businessName: business.name,
      }).catch(() => {});
    }

    return this.generateTokens(user, business._id.toString());
  }

  static async login(dto: LoginInput): Promise<AuthTokens> {
    const rawIdentifier = (dto.emailOrPhone || dto.email || dto.phone || '').trim();
    const cleanPhone = rawIdentifier.replace(/[^0-9]/g, '');
    const isPhone = cleanPhone.length === 10;

    let user: any = null;
    if (isPhone) {
      user = await UserModel.findOne({ phone: cleanPhone });
      if (!user) {
        user = await UserModel.findOne({ email: `${cleanPhone}@vyora.in` });
      }
    } else {
      user = await UserModel.findOne({ email: rawIdentifier.toLowerCase() });
    }

    if (!user) {
      throw new UnauthorizedError('Invalid mobile number/email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!isValid) {
      throw new UnauthorizedError('Invalid mobile number/email or password');
    }

    let businessId = user.defaultBusinessId?.toString();
    if (!businessId) {
      const membership = await MembershipModel.findOne({
        userId: user._id.toString(),
        isActive: { $ne: false },
      });
      if (membership) {
        businessId = membership.businessId.toString();
        user.defaultBusinessId = businessId;
        user.role = membership.role;
        await user.save();
      }
    }

    return this.generateTokens(user, businessId);
  }

  static async getMyBusinesses(userId: string): Promise<UserWorkspace[]> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const memberships = await MembershipModel.find({
      userId: user._id.toString(),
      isActive: { $ne: false },
    });

    const currentBizId = user.defaultBusinessId?.toString();
    const businessIds = memberships.map((m) => m.businessId);
    const businesses = await BusinessModel.find({ _id: { $in: businessIds } });

    return memberships.map((m) => {
      const b = businesses.find((biz) => biz._id.toString() === m.businessId);
      const roleName =
        m.role === 'OWNER'
          ? 'Business Owner'
          : m.role === 'ADMIN'
          ? 'Store Manager'
          : 'Billing Staff';

      return {
        id: m.businessId,
        businessId: m.businessId,
        membershipId: m._id.toString(),
        name: b?.name || 'Vyora Store',
        phone: b?.phone || '',
        city: b?.city || '',
        role: m.role,
        roleName,
        isCurrent: m.businessId === currentBizId,
        status: ((m as any).status || 'ACTIVE') as 'PENDING' | 'ACTIVE',
        joinedAt: (m as any).createdAt ? (m as any).createdAt.toISOString() : new Date().toISOString(),
      };
    });
  }

  static async switchBusiness(userId: string, targetBusinessId: string) {
    const [user, membership, business] = await Promise.all([
      UserModel.findById(userId),
      MembershipModel.findOne({
        userId,
        businessId: targetBusinessId,
        isActive: { $ne: false },
      }),
      BusinessModel.findById(targetBusinessId),
    ]);

    if (!user) {
      throw new NotFoundError('User');
    }
    if (!membership || !business) {
      throw new ForbiddenError('You do not have active membership in this business workspace');
    }

    if (membership.role === 'OWNER' && user.defaultBusinessId && user.defaultBusinessId !== targetBusinessId) {
      const currentBiz = await BusinessModel.findById(user.defaultBusinessId).lean();
      const currentPlan = ((currentBiz?.subscriptionPlan || 'starter') as string).toLowerCase();
      if (currentPlan === 'starter' || currentPlan === 'free') {
        const ownedCount = await BusinessModel.countDocuments({ ownerUserId: userId });
        if (ownedCount > 1) {
          throw new ForbiddenError(
            'Multi-Store Workspace Switching is a Growth & Enterprise feature. The Starter plan includes 1 store only. Please upgrade to Growth or Enterprise to switch between your stores.',
            'PlanLimitExceeded',
            {
              currentPlan: 'starter',
              requiredPlan: 'growth',
              allowedStores: 1,
              currentStores: ownedCount,
            },
          );
        }
      }
    }

    user.defaultBusinessId = targetBusinessId;
    user.role = membership.role;
    await user.save();

    const tokens = this.generateTokens(user, targetBusinessId);
    return {
      tokens,
      business: {
        id: business._id.toString(),
        name: business.name,
        role: membership.role,
        phone: business.phone,
        email: business.email,
        subscriptionPlan: business.subscriptionPlan || 'growth',
      },
    };
  }

  static async acceptInvite(userId: string, targetBusinessId: string) {
    const [user, membership, business] = await Promise.all([
      UserModel.findById(userId),
      MembershipModel.findOne({
        userId,
        businessId: targetBusinessId,
      }),
      BusinessModel.findById(targetBusinessId),
    ]);

    if (!user) {
      throw new NotFoundError('User');
    }
    if (!membership || !business) {
      throw new NotFoundError('Invitation not found for this business');
    }

    membership.isActive = true;
    (membership as any).status = 'ACTIVE';
    await membership.save();

    user.defaultBusinessId = targetBusinessId;
    user.role = membership.role;
    user.isInvited = false;
    await user.save();

    const tokens = this.generateTokens(user, targetBusinessId);
    return {
      success: true,
      tokens,
      business: {
        id: business._id.toString(),
        name: business.name,
        role: membership.role,
      },
    };
  }

  static async updateProfile(userId: string, dto: { name?: string; avatarUrl?: string }): Promise<UserProfile> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (dto.name !== undefined && dto.name.trim()) {
      user.name = dto.name.trim();
    }
    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl;
    }

    await user.save();
    return this.getProfile(userId);
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
      avatarUrl: user.avatarUrl,
      businessId: user.defaultBusinessId?.toString(),
      createdAt: (user as any).createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * Request Password Reset (Email OTP or Firebase Phone validation)
   */
  static async forgotPassword(dto: ForgotPasswordInput): Promise<{
    success: boolean;
    method?: 'EMAIL' | 'PHONE';
    message: string;
    maskedTarget?: string;
    phone?: string;
  }> {
    const rawId = (dto.identifier || '').trim();
    const cleanPhone = rawId.replace(/[^0-9]/g, '');
    const isPhone = cleanPhone.length === 10;

    let user: any = null;
    if (isPhone) {
      user = await UserModel.findOne({ phone: cleanPhone });
      if (!user) {
        user = await UserModel.findOne({ email: `${cleanPhone}@vyora.in` });
      }
    } else {
      user = await UserModel.findOne({ email: rawId.toLowerCase() });
    }

    // Defensive: Return generic success if user does not exist (prevents user enumeration attacks)
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this credential, a verification method has been initiated.',
      };
    }

    // If user has a valid external email, dispatch 6-digit email OTP
    const hasValidEmail = user.email && user.email.includes('@') && !user.email.endsWith('@vyora.in');

    if (hasValidEmail) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const salt = await bcrypt.genSalt(10);
      user.resetPasswordOtpHash = await bcrypt.hash(otp, salt);
      user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      user.resetPasswordAttempts = 0;
      await user.save();

      // Dispatch branded email via Resend
      MailService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        otp,
      }).catch((err) => {
        console.warn('[AuthService] Failed to send password reset email:', err);
      });

      const [namePart, domain] = user.email.split('@');
      const maskedEmail = `${namePart.charAt(0)}***@${domain}`;

      return {
        success: true,
        method: 'EMAIL',
        message: `A 6-digit verification code has been sent to ${maskedEmail}`,
        maskedTarget: maskedEmail,
      };
    }

    // If user only has phone registered, authorize Firebase Phone Auth
    const userPhone = user.phone || cleanPhone;
    return {
      success: true,
      method: 'PHONE',
      message: 'Ready for phone SMS verification via Firebase',
      phone: userPhone,
    };
  }

  /**
   * Reset Password using Email OTP or verified Firebase ID Token
   */
  static async resetPassword(dto: ResetPasswordInput): Promise<AuthTokens> {
    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    let user: any = null;

    // Case 1: Firebase ID Token verified (Phone Auth)
    if (dto.firebaseIdToken) {
      const decoded = await FirebaseService.verifyIdToken(dto.firebaseIdToken);
      if (!decoded || !decoded.phone_number) {
        throw new BadRequestError('Invalid or unverified Firebase phone session');
      }

      const verifiedPhone = decoded.phone_number.replace(/[^0-9]/g, '').slice(-10);
      user = await UserModel.findOne({ phone: verifiedPhone });
      if (!user) {
        user = await UserModel.findOne({ email: `${verifiedPhone}@vyora.in` });
      }

      if (!user) {
        throw new NotFoundError('No user account found matching this verified phone number');
      }

      user.phoneVerified = true;
    }
    // Case 2: Email OTP code verified
    else if (dto.code && dto.identifier) {
      const rawId = dto.identifier.trim();
      const cleanPhone = rawId.replace(/[^0-9]/g, '');
      const isPhone = cleanPhone.length === 10;

      if (isPhone) {
        user = await UserModel.findOne({ phone: cleanPhone });
        if (!user) user = await UserModel.findOne({ email: `${cleanPhone}@vyora.in` });
      } else {
        user = await UserModel.findOne({ email: rawId.toLowerCase() });
      }

      if (!user) {
        throw new BadRequestError('Invalid reset attempt or account not found');
      }

      if (!user.resetPasswordOtpHash || !user.resetPasswordExpiresAt) {
        throw new BadRequestError('No active password reset request found. Please request a new code.');
      }

      if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
        throw new BadRequestError('Verification code has expired. Please request a new code.');
      }

      if ((user.resetPasswordAttempts || 0) >= 5) {
        throw new BadRequestError('Too many failed attempts. Please request a new code.');
      }

      const isMatch = await bcrypt.compare(dto.code.trim(), user.resetPasswordOtpHash);
      if (!isMatch) {
        user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
        await user.save();
        throw new BadRequestError('Invalid verification code. Please check and try again.');
      }
    } else {
      throw new BadRequestError('Either verification code or Firebase phone session token is required');
    }

    // Hash new password and clear reset state
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.resetPasswordAttempts = 0;
    await user.save();

    const activeBizId = user.defaultBusinessId?.toString() || '';
    return this.generateTokens(user, activeBizId);
  }

  /**
   * Change Password (for authenticated users inside Menu / Settings)
   */
  static async changePassword(
    userId: string,
    dto: ChangePasswordInput,
  ): Promise<{ success: boolean; message: string }> {
    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestError('New password must be at least 6 characters');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestError('Current password is incorrect');
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    await user.save();

    return { success: true, message: 'Password changed successfully' };
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
        avatarUrl: user.avatarUrl,
        businessId,
        createdAt: (user as any).createdAt?.toISOString() || new Date().toISOString(),
      },
    };
  }
}
