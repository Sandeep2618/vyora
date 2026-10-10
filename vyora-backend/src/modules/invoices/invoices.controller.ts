import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateInvoiceSchema, CancelInvoiceSchema, CreateInvoiceInput, CancelInvoiceInput } from '@vyora/validation';
import { InvoiceStatus } from '@vyora/shared-types';

@ApiTags('Sales Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Calculate live authoritative invoice totals and tax breakdowns' })
  async preview(
    @CurrentTenant() businessId: string,
    @Body() body: CreateInvoiceInput,
  ) {
    const validated = CreateInvoiceSchema.parse(body);
    return this.invoicesService.previewInvoice(businessId, validated);
  }

  @Post()
  @ApiOperation({ summary: 'Create invoice (draft or finalize immediately)' })
  @ApiQuery({ name: 'finalize', required: false, type: Boolean })
  async create(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Body() body: CreateInvoiceInput,
    @Query('finalize') finalize?: string,
  ) {
    const validated = CreateInvoiceSchema.parse(body);
    const shouldFinalize = finalize === 'true';
    return this.invoicesService.create(businessId, validated, user.id, shouldFinalize);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices with filtering' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @CurrentTenant() businessId: string,
    @Query('status') status?: InvoiceStatus,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.invoicesService.findAll(businessId, {
      status,
      customerId,
      search,
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full invoice detail with lines and snapshots' })
  async findOne(@CurrentTenant() businessId: string, @Param('id') id: string) {
    return this.invoicesService.findOne(businessId, id);
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finalize a draft invoice, assign unique sequence number, deduct stock' })
  async finalize(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.invoicesService.finalize(businessId, id, user.id, user.name);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Controlled invoice cancellation with stock and balance reversal' })
  async cancel(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: CancelInvoiceInput,
  ) {
    const validated = CancelInvoiceSchema.parse(body);
    return this.invoicesService.cancel(businessId, id, validated, user.id, user.name);
  }
}
