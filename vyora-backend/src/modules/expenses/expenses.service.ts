import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExpenseRecord, ExpenseRecordDocument } from './schemas/expense.schema';
import { CreateExpenseInput } from '@vyora/validation';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(ExpenseRecord.name)
    private readonly expenseModel: Model<ExpenseRecordDocument>,
  ) {}

  async create(businessId: string, dto: CreateExpenseInput, userId: string) {
    const expense = new this.expenseModel({
      businessId,
      ...dto,
      createdByUserId: userId,
    });
    await expense.save();
    return this.mapExpense(expense);
  }

  async findAll(
    businessId: string,
    query: {
      category?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      skip?: number;
    },
  ) {
    const filter: any = { businessId };
    if (query.category) {
      filter.category = query.category;
    }
    if (query.startDate || query.endDate) {
      filter.expenseDate = {};
      if (query.startDate) filter.expenseDate.$gte = query.startDate;
      if (query.endDate) filter.expenseDate.$lte = query.endDate;
    }

    const limit = query.limit || 50;
    const skip = query.skip || 0;

    const [items, total] = await Promise.all([
      this.expenseModel.find(filter).sort({ expenseDate: -1 }).limit(limit).skip(skip),
      this.expenseModel.countDocuments(filter),
    ]);

    return {
      items: items.map((e) => this.mapExpense(e)),
      total,
      limit,
      skip,
    };
  }

  async getCategories(businessId: string): Promise<string[]> {
    const defaultCategories = [
      'Rent & Office',
      'Utilities & Internet',
      'Logistics & Courier',
      'Salaries & Wages',
      'Marketing & Ads',
      'Maintenance',
      'Miscellaneous',
    ];
    const customCategories = await this.expenseModel.distinct('category', { businessId });
    return Array.from(new Set([...defaultCategories, ...customCategories]));
  }

  async remove(businessId: string, id: string) {
    const res = await this.expenseModel.findOneAndDelete({ _id: id, businessId });
    if (!res) {
      throw new NotFoundException('Expense not found');
    }
    return { success: true };
  }

  private mapExpense(doc: ExpenseRecordDocument) {
    return {
      id: doc._id.toString(),
      businessId: doc.businessId,
      category: doc.category,
      amountMinor: doc.amountMinor,
      expenseDate: doc.expenseDate,
      paymentMethod: doc.paymentMethod,
      vendorName: doc.vendorName,
      notes: doc.notes,
      createdAt: (doc as any).createdAt,
    };
  }
}
