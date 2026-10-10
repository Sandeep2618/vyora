import { Controller, Get, Put, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BusinessProfileSchema, BusinessProfileInput } from '@vyora/validation';
import { UserRole } from '@vyora/shared-types';

@ApiTags('Business Settings & Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get profile details and invoice settings for current business' })
  async getCurrent(@CurrentTenant() businessId: string) {
    return this.businessService.getBusinessById(businessId);
  }

  @Put('current')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update business profile, tax settings, and document formatting (Owner only)' })
  async updateCurrent(
    @CurrentTenant() businessId: string,
    @Body() body: BusinessProfileInput,
  ) {
    const validated = BusinessProfileSchema.parse(body);
    return this.businessService.updateBusiness(businessId, validated);
  }

  @Put('plan')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Upgrade or change subscription plan (Owner only)' })
  async updatePlan(
    @CurrentTenant() businessId: string,
    @Body() body: { plan: 'starter' | 'growth' | 'enterprise' },
  ) {
    return this.businessService.updateSubscriptionPlan(businessId, body.plan);
  }

  @Get('staff')
  @ApiOperation({ summary: 'List all staff members and roles for this business' })
  async getStaff(@CurrentTenant() businessId: string) {
    return this.businessService.getStaff(businessId);
  }

  @Post('staff')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Add a staff member with role (Owner only)' })
  async addStaff(
    @CurrentTenant() businessId: string,
    @Body() body: { name: string; email: string; role: UserRole },
  ) {
    return this.businessService.addStaffMember(businessId, body);
  }

  @Patch('staff/:id/role')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Switch or change member role (Owner only)' })
  async updateStaffRole(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Param('id') membershipId: string,
    @Body() body: { role: UserRole },
  ) {
    return this.businessService.updateStaffRole(businessId, membershipId, body.role, user?.id);
  }

  @Patch('staff/:id/status')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Toggle member access active status (Owner only)' })
  async toggleStaffStatus(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Param('id') membershipId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.businessService.toggleStaffStatus(businessId, membershipId, body.isActive, user?.id);
  }

  @Delete('staff/:id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Remove a team member from this business (Owner only)' })
  async removeStaff(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Param('id') membershipId: string,
  ) {
    return this.businessService.removeStaffMember(businessId, membershipId, user?.id);
  }
}
