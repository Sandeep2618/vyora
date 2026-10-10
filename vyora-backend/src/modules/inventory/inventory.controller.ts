import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePlan } from '../../common/decorators/plan.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StockAdjustmentSchema, StockAdjustmentInput } from '@vyora/validation';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, PlanGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  @ApiOperation({ summary: 'Get traceable stock movement ledger' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async getMovements(
    @CurrentTenant() businessId: string,
    @Query('productId') productId?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.inventoryService.getMovements(
      businessId,
      productId,
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Post('adjustments')
  @Roles('OWNER', 'ADMIN')
  @RequirePlan('enterprise')
  @ApiOperation({ summary: 'Record a manual stock adjustment with mandatory audit reason (Owner & Enterprise plan only)' })
  async createAdjustment(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Body() body: StockAdjustmentInput,
  ) {
    const validated = StockAdjustmentSchema.parse(body);
    return this.inventoryService.manualAdjustment(
      businessId,
      validated.productId,
      validated.quantityDelta,
      validated.reason,
      user.id,
      user.name,
    );
  }
}
