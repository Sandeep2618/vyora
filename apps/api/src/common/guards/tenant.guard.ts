import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MembershipDocument } from '../../modules/business/schemas/membership.schema';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectModel('Membership')
    private readonly membershipModel: Model<MembershipDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check header override or query/param, else fallback to user default business
    const requestedBusinessId =
      request.headers['x-business-id'] ||
      request.params?.businessId ||
      request.query?.businessId ||
      user.businessId;

    if (!requestedBusinessId) {
      throw new ForbiddenException('No active business selected. Please complete business onboarding.');
    }

    // Verify authorized membership in the business
    const membership = await this.membershipModel.findOne({
      userId: user.id,
      businessId: requestedBusinessId,
    });

    if (!membership) {
      throw new ForbiddenException('Access denied: You do not have permission for this business');
    }

    // Attach verified businessId and role to request
    request.businessId = requestedBusinessId.toString();
    request.businessRole = membership.role;

    return true;
  }
}
