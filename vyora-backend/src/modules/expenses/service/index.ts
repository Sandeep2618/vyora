import { ExpenseRecordModel, IExpenseRecord } from '../model';
import { NotFoundError } from '../../../util';
import { CreateExpenseInput } from '../validator';

export class ExpensesService {
  static async create(businessId: string, dto: CreateExpenseInput, userId: string) {
    let expenseNumber = dto.expenseNumber?.trim();
    if (!expenseNumber) {
      const count = await ExpenseRecordModel.countDocuments({ businessId });
      expenseNumber = `EXP-${String(count + 1).padStart(4, '0')}`;
    }

    const expense = new ExpenseRecordModel({
      businessId,
      ...dto,
      expenseNumber,
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

    const limit = query.limit || 100;
    const skip = query.skip || 0;

    const [items, total] = await Promise.all([
      ExpenseRecordModel.find(filter)
        .sort({ expenseDate: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip),
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
      'Manufacturing Expense',
      'Petrol',
      'Rent',
      'Salary',
      'Tea',
      'Transport',
      'Milk & Dairy',
      'Utilities & Electricity',
      'Logistics & Courier',
      'Maintenance & Repair',
      'Miscellaneous',
    ];
    const customCategories = await ExpenseRecordModel.distinct('category', { businessId });
    return Array.from(new Set([...defaultCategories, ...customCategories]));
  }

  static async getSummaryBreakdown(businessId: string) {
    const expenses = await ExpenseRecordModel.find({ businessId }).lean();

    const categoryTotals: Record<string, { totalAmountMinor: number; count: number }> = {};
    const defaultCategories = [
      'Manufacturing Expense',
      'Petrol',
      'Rent',
      'Salary',
      'Tea',
      'Transport',
    ];
    defaultCategories.forEach((cat) => {
      categoryTotals[cat] = { totalAmountMinor: 0, count: 0 };
    });

    const itemTotals: Record<string, { totalAmountMinor: number; totalQuantity: number }> = {};
    let grandTotalMinor = 0;

    for (const exp of expenses as any[]) {
      grandTotalMinor += exp.amountMinor || 0;
      const cat = exp.category || 'Miscellaneous';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { totalAmountMinor: 0, count: 0 };
      }
      categoryTotals[cat].totalAmountMinor += exp.amountMinor || 0;
      categoryTotals[cat].count += 1;

      if (Array.isArray(exp.items) && exp.items.length > 0) {
        for (const itm of exp.items) {
          const name = itm.itemName?.trim() || 'General Item';
          if (!itemTotals[name]) {
            itemTotals[name] = { totalAmountMinor: 0, totalQuantity: 0 };
          }
          itemTotals[name].totalAmountMinor += itm.amountMinor || 0;
          itemTotals[name].totalQuantity += itm.quantity || 1;
        }
      } else {
        const name = exp.vendorName?.trim() || exp.category || 'General';
        if (!itemTotals[name]) {
          itemTotals[name] = { totalAmountMinor: 0, totalQuantity: 0 };
        }
        itemTotals[name].totalAmountMinor += exp.amountMinor || 0;
        itemTotals[name].totalQuantity += 1;
      }
    }

    const categories = Object.keys(categoryTotals).map((name) => ({
      name,
      totalAmountMinor: categoryTotals[name].totalAmountMinor,
      count: categoryTotals[name].count,
    }));

    const items = Object.keys(itemTotals).map((name) => ({
      name,
      totalAmountMinor: itemTotals[name].totalAmountMinor,
      totalQuantity: itemTotals[name].totalQuantity,
    }));

    return {
      grandTotalMinor,
      categories,
      items,
    };
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
      expenseNumber: doc.expenseNumber || `EXP-${doc._id.toString().substring(18).toUpperCase()}`,
      category: doc.category,
      amountMinor: doc.amountMinor,
      expenseDate: doc.expenseDate,
      paymentMethod: doc.paymentMethod,
      vendorName: doc.vendorName,
      notes: doc.notes,
      isGst: doc.isGst || false,
      items: (doc.items || []).map((itm: any) => ({
        itemName: itm.itemName,
        quantity: itm.quantity,
        rateMinor: itm.rateMinor,
        amountMinor: itm.amountMinor,
      })),
      createdAt: (doc as any).createdAt,
    };
  }

  static async getExportData(
    businessId: string,
    query: {
      category?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
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
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { expenseNumber: regex },
        { vendorName: regex },
        { category: regex },
        { notes: regex },
      ];
    }

    const expenses = await ExpenseRecordModel.find(filter).sort({ expenseDate: -1, createdAt: -1 }).lean();
    return expenses.map((e) => this.mapExpense(e as any));
  }
}
