import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateExpenseSchema, CreateExpenseInput } from '@vyora/validation';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense entry' })
  async create(
    @CurrentTenant() businessId: string,
    @CurrentUser() user: any,
    @Body() body: CreateExpenseInput,
  ) {
    const validated = CreateExpenseSchema.parse(body);
    return this.expensesService.create(businessId, validated, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses with category and date range filter' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @CurrentTenant() businessId: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.expensesService.findAll(businessId, {
      category,
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0,
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'List expense categories for business' })
  async getCategories(@CurrentTenant() businessId: string) {
    return this.expensesService.getCategories(businessId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense entry' })
  async remove(@CurrentTenant() businessId: string, @Param('id') id: string) {
    return this.expensesService.remove(businessId, id);
  }
}
