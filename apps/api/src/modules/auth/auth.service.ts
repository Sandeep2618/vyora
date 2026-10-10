import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { Business, BusinessDocument } from '../business/schemas/business.schema';
import { Membership, MembershipDocument } from '../business/schemas/membership.schema';
import { RegisterInput, LoginInput } from '@vyora/validation';
import { AuthTokens, UserProfile } from '@vyora/shared-types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(Membership.name)
    private readonly membershipModel: Model<MembershipDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterInput): Promise<AuthTokens> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = new this.userModel({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: 'OWNER',
    });
    await user.save();

    // Create default business if businessName provided, or create initial onboarding business
    const businessName = dto.businessName || `${dto.name}'s Business`;
    const business = new this.businessModel({
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

    // Assign OWNER membership
    const membership = new this.membershipModel({
      userId: user._id.toString(),
      businessId: business._id.toString(),
      role: 'OWNER',
    });
    await membership.save();

    user.defaultBusinessId = business._id.toString();
    await user.save();

    return this.generateTokens(user, business._id.toString());
  }

  async login(dto: LoginInput): Promise<AuthTokens> {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    let businessId = user.defaultBusinessId?.toString();
    if (!businessId) {
      const membership = await this.membershipModel.findOne({ userId: user._id.toString() });
      if (membership) {
        businessId = membership.businessId.toString();
        user.defaultBusinessId = businessId;
        await user.save();
      }
    }

    return this.generateTokens(user, businessId);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: user.defaultBusinessId?.toString(),
      createdAt: (user as any).createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  private generateTokens(user: UserDocument, businessId?: string): AuthTokens {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      businessId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        businessId,
        createdAt: (user as any).createdAt?.toISOString() || new Date().toISOString(),
      },
    };
  }
}
