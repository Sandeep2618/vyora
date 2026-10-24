import { Response } from 'express';
import { ExpensesService } from '../service';
import { ApiResponse, asyncHandler, generateCsv, sendCsvResponse, minorToMajor } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class ExpensesController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const expense = await ExpensesService.create(req.businessId!, req.body, req.user!.id);
    return ApiResponse.created(res, expense);
  });

  static findAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = req.query.category as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    const result = await ExpensesService.findAll(req.businessId!, {
      category,
      startDate,
      endDate,
      limit,
      skip,
    });
    return ApiResponse.success(res, result);
  });

  static getCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const categories = await ExpensesService.getCategories(req.businessId!);
    return ApiResponse.success(res, categories);
  });

  static remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ExpensesService.remove(req.businessId!, req.params.id as string, req.user?.id);
    return ApiResponse.success(res, result);
  });

  static exportCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = req.query.category as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const search = req.query.search as string | undefined;

    const expenses = await ExpensesService.getExportData(req.businessId!, {
      category,
      startDate,
      endDate,
      search,
    });

    const columns = [
      { header: 'Expense No', key: 'expenseNumber' },
      { header: 'Date', key: 'expenseDate' },
      { header: 'Category', key: 'category' },
      { header: 'Vendor / Payee', key: 'vendorName' },
      { header: 'Amount', format: (e: any) => minorToMajor(e.amountMinor || 0) },
      { header: 'Payment Method', key: 'paymentMethod' },
      { header: 'GST Applicable', format: (e: any) => (e.isGst ? 'Yes' : 'No') },
      { header: 'Notes', key: 'notes' },
    ];

    const csv = generateCsv(columns, expenses);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `expenses_${dateStr}.csv`, csv);
  });
}
