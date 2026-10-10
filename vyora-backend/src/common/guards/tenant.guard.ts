import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MembershipDocument } from '../../modules/business/schemas/membership.schema';
import { BusinessDocument } from '../../modules/business/schemas/business.schema';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectModel('Membership')
    private readonly membershipModel: Model<MembershipDocument>,
    @Optional()
    @InjectModel('Business')
    private readonly businessModel?: Model<BusinessDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required');
    }

    const userIdStr = user.id.toString();

    // 1. Resolve requested business ID from headers (case-insensitive), query, params, or JWT user payload
    let requestedBusinessId =
      request.headers['x-business-id'] ||
      request.headers['X-Business-Id'] ||
      request.headers['x-tenant-id'] ||
      request.params?.businessId ||
      request.query?.businessId ||
      user.businessId;

    // Sanitize literal string "undefined", "null", or empty strings
    if (
      !requestedBusinessId ||
      requestedBusinessId === 'undefined' ||
      requestedBusinessId === 'null' ||
      requestedBusinessId === '[object Object]'
    ) {
      requestedBusinessId = null;
    }

    // 2. If no businessId in headers/params, auto-discover user's business from database
    if (!requestedBusinessId) {
      try {
        // Look up existing membership
        const userMembership = await this.membershipModel.findOne({
          $or: [
            { userId: userIdStr },
            ...(Types.ObjectId.isValid(userIdStr) ? [{ userId: new Types.ObjectId(userIdStr) as any }] : []),
          ],
        });

        if (userMembership && userMembership.businessId && userMembership.businessId !== 'undefined') {
          requestedBusinessId = userMembership.businessId.toString();
        } else if (this.businessModel) {
          // Look up owned business
          const ownedBusiness = await this.businessModel.findOne({
            $or: [
              { ownerUserId: userIdStr },
              ...(Types.ObjectId.isValid(userIdStr) ? [{ ownerUserId: new Types.ObjectId(userIdStr) as any }] : []),
            ],
          });
          if (ownedBusiness) {
            requestedBusinessId = ownedBusiness._id.toString();
            await this.membershipModel
              .create({
                userId: userIdStr,
                businessId: requestedBusinessId,
                role: 'OWNER',
              })
              .catch(() => null);
          }
        }
      } catch {
        requestedBusinessId = null;
      }
    }

    // 3. If user still has NO business at all and is an OWNER, auto-provision initial business
    if (!requestedBusinessId) {
      if (user.role === 'OWNER' && this.businessModel) {
        const defaultBusiness = await this.businessModel.create({
          name: `${user.name || 'My'}'s Business`,
          phone: '9876543210',
          email: user.email,
          addressLine1: 'Main Market',
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
          ownerUserId: userIdStr,
        });
        requestedBusinessId = defaultBusiness._id.toString();
        await this.membershipModel
          .create({
            userId: userIdStr,
            businessId: requestedBusinessId,
            role: 'OWNER',
          })
          .catch(() => null);
      } else {
        throw new ForbiddenException('No active business selected. Please complete business onboarding.');
      }
    }

    const businessIdStr = requestedBusinessId.toString();

    // 4. Verify authorized membership in the business
    let membership: any = null;
    try {
      membership = await this.membershipModel.findOne({
        userId: userIdStr,
        businessId: businessIdStr,
      });

      // Flexible check if not found with exact strings
      if (!membership) {
        membership = await this.membershipModel.findOne({
          $and: [
            {
              $or: [
                { userId: userIdStr },
                ...(Types.ObjectId.isValid(userIdStr) ? [{ userId: new Types.ObjectId(userIdStr) as any }] : []),
              ],
            },
            {
              $or: [
                { businessId: businessIdStr },
                ...(Types.ObjectId.isValid(businessIdStr) ? [{ businessId: new Types.ObjectId(businessIdStr) as any }] : []),
              ],
            },
          ],
        });
      }
    } catch {
      membership = null;
    }

    let effectiveRole = membership?.role;

    if (!membership) {
      // Fallback check: is user the owner of this business?
      if (this.businessModel && Types.ObjectId.isValid(businessIdStr)) {
        try {
          const isOwner = await this.businessModel.findOne({
            _id: new Types.ObjectId(businessIdStr),
            $or: [
              { ownerUserId: userIdStr },
              ...(Types.ObjectId.isValid(userIdStr) ? [{ ownerUserId: new Types.ObjectId(userIdStr) as any }] : []),
            ],
          });

          if (isOwner) {
            effectiveRole = 'OWNER';
            await this.membershipModel
              .create({
                userId: userIdStr,
                businessId: businessIdStr,
                role: 'OWNER',
              })
              .catch(() => null);
          } else {
            throw new ForbiddenException('Access denied: You do not have permission for this business');
          }
        } catch (err: any) {
          if (err instanceof ForbiddenException) throw err;
          throw new ForbiddenException('Access denied: You do not have permission for this business');
        }
      } else {
        throw new ForbiddenException('Access denied: You do not have permission for this business');
      }
    }

    // Attach verified businessId, role, and subscriptionPlan to request
    request.businessId = businessIdStr;
    request.businessRole = effectiveRole || user.role || 'OWNER';

    if (this.businessModel && Types.ObjectId.isValid(businessIdStr)) {
      const biz = await this.businessModel.findById(businessIdStr).select('subscriptionPlan').lean();
      request.businessPlan = (biz as any)?.subscriptionPlan || 'starter';
    } else {
      request.businessPlan = 'starter';
    }

    return true;
  }
}
