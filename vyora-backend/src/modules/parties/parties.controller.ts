import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PartiesService } from './parties.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { PartySchema, PartyInput } from '@vyora/validation';
import { PartyType } from '@vyora/shared-types';

@ApiTags('Customers & Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Create a new customer or supplier (Owner only)' })
  async create(
    @CurrentTenant() businessId: string,
    @Body() body: PartyInput,
  ) {
    const validated = PartySchema.parse(body);
    return this.partiesService.create(businessId, validated);
  }

  @Get()
  @ApiOperation({ summary: 'List parties (customers/suppliers) with search & balance' })
  @ApiQuery({ name: 'type', required: false, enum: ['CUSTOMER', 'SUPPLIER', 'BOTH'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @CurrentTenant() businessId: string,
    @Query('type') type?: PartyType,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.partiesService.findAll(businessId, {
      type,
      search,
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get party details and address' })
  async findOne(@CurrentTenant() businessId: string, @Param('id') id: string) {
    return this.partiesService.findOne(businessId, id);
  }

  @Put(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update customer/supplier details (Owner only)' })
  async update(
    @CurrentTenant() businessId: string,
    @Param('id') id: string,
    @Body() body: PartyInput,
  ) {
    const validated = PartySchema.parse(body);
    return this.partiesService.update(businessId, id, validated);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Delete customer or supplier (Owner only)' })
  async delete(
    @CurrentTenant() businessId: string,
    @Param('id') id: string,
  ) {
    return this.partiesService.delete(businessId, id);
  }
}
