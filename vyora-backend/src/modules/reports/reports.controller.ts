import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-register')
  @ApiOperation({ summary: 'Get sales register with tax breakdowns' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSalesRegister(
    @CurrentTenant() businessId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesRegister(businessId, startDate, endDate);
  }

  @Get('purchase-register')
  @ApiOperation({ summary: 'Get purchase register' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getPurchaseRegister(
    @CurrentTenant() businessId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPurchaseRegister(businessId, startDate, endDate);
  }

  @Get('stock-summary')
  @ApiOperation({ summary: 'Get stock inventory summary and valuation' })
  async getStockSummary(@CurrentTenant() businessId: string) {
    return this.reportsService.getStockSummary(businessId);
  }

  @Get('customer-dues')
  @ApiOperation({ summary: 'Get customer outstanding dues and receivables' })
  async getCustomerDues(@CurrentTenant() businessId: string) {
    return this.reportsService.getCustomerDues(businessId);
  }

  @Get('expense-summary')
  @ApiOperation({ summary: 'Get categorized expense summary' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getExpenseSummary(
    @CurrentTenant() businessId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getExpenseSummary(businessId, startDate, endDate);
  }
}
