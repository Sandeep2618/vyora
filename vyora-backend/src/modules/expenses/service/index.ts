import { ExpenseRecordModel, IExpenseRecord } from '../model';
import { NotFoundError } from '../../../util';
import { CreateExpenseInput } from '../validator';

export class ExpensesService {
  static async create(businessId: string, dto: CreateExpenseInput, userId: string) {
    const expense = new ExpenseRecordModel({
      businessId,
      ...dto,
      createdByUserId: userId,
    });
    await expense.save();
    return this.mapExpense(expense);
  }

  static async findAll(
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
      ExpenseRecordModel.find(filter).sort({ expenseDate: -1 }).limit(limit).skip(skip),
      ExpenseRecordModel.countDocuments(filter),
    ]);

    return {
      items: items.map((e) => this.mapExpense(e)),
      total,
      limit,
      skip,
    };
  }

  static async getCategories(businessId: string): Promise<string[]> {
    const defaultCategories = [
      'Rent & Office',
      'Utilities & Internet',
      'Logistics & Courier',
      'Salaries & Wages',
      'Marketing & Ads',
      'Maintenance',
      'Miscellaneous',
    ];
    const customCategories = await ExpenseRecordModel.distinct('category', { businessId });
    return Array.from(new Set([...defaultCategories, ...customCategories]));
  }

  static async remove(businessId: string, id: string) {
    const res = await ExpenseRecordModel.findOneAndDelete({ _id: id, businessId });
    if (!res) {
      throw new NotFoundError('Expense');
    }
    return { success: true };
  }

  static mapExpense(doc: IExpenseRecord) {
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
