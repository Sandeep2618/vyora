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
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductSchema, ProductInput } from '@vyora/validation';

@ApiTags('Products & Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Create a new product or service (Owner only)' })
  async create(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Body() body: ProductInput,
  ) {
    const validated = ProductSchema.parse(body);
    return this.productsService.create(businessId, validated, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter products' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'lowStockOnly', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @CurrentTenant() businessId: string,
    @Query('search') search?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.productsService.findAll(businessId, {
      search,
      lowStockOnly: lowStockOnly === 'true',
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  async findOne(@CurrentTenant() businessId: string, @Param('id') id: string) {
    return this.productsService.findOne(businessId, id);
  }

  @Put(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update product details (Owner only)' })
  async update(
    @CurrentTenant() businessId: string,
    @Param('id') id: string,
    @Body() body: ProductInput,
  ) {
    const validated = ProductSchema.parse(body);
    return this.productsService.update(businessId, id, validated);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Archive product (Owner only)' })
  async archive(@CurrentTenant() businessId: string, @Param('id') id: string) {
    return this.productsService.archive(businessId, id);
  }
}
