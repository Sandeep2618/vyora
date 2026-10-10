import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePlan } from '../../common/decorators/plan.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePurchaseSchema, CreatePurchaseInput } from '@vyora/validation';

@ApiTags('Purchase Bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, PlanGuard)
@RequirePlan('growth')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Record supplier purchase bill and receive inventory (Owner only)' })
  async create(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Body() body: CreatePurchaseInput,
  ) {
    const validated = CreatePurchaseSchema.parse(body);
    return this.purchasesService.create(businessId, validated, user.id, user.name);
  }

  @Get()
  @ApiOperation({ summary: 'List purchase bills' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @CurrentTenant() businessId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.purchasesService.findAll(
      businessId,
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase bill details' })
  async findOne(@CurrentTenant() businessId: string, @Param('id') id: string) {
    return this.purchasesService.findOne(businessId, id);
  }
}
