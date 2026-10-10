import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
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
}
