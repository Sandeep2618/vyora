import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreatePaymentSchema, CreatePaymentInput } from '@vyora/validation';

@ApiTags('Payments & Receipts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a payment or receipt voucher with idempotency protection' })
  async create(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Body() body: CreatePaymentInput,
  ) {
    const validated = CreatePaymentSchema.parse(body);
    return this.paymentsService.create(businessId, validated, user.id, user.name);
  }

  @Get()
  @ApiOperation({ summary: 'List payments and receipts' })
  @ApiQuery({ name: 'partyId', required: false })
  @ApiQuery({ name: 'invoiceId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @CurrentTenant() businessId: string,
    @Query('partyId') partyId?: string,
    @Query('invoiceId') invoiceId?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.paymentsService.findAll(businessId, {
      partyId,
      invoiceId,
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment receipt voucher details' })
  async findOne(@CurrentTenant() businessId: string, @Param('id') id: string) {
    return this.paymentsService.findOne(businessId, id);
  }
}
