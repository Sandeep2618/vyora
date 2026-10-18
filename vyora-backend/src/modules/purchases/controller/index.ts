import { Response } from 'express';
import { PurchasesService } from '../service';
import { ApiResponse, asyncHandler, generateCsv, sendCsvResponse, minorToMajor } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class PurchasesController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const purchase = await PurchasesService.create(
      req.businessId!,
      req.body,
      req.user!.id,
      req.user!.name,
    );
    return ApiResponse.created(res, purchase);
  });

  static findAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
    const result = await PurchasesService.findAll(req.businessId!, limit, skip);
    return ApiResponse.success(res, result);
  });

  static findOne = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const purchase = await PurchasesService.findOne(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, purchase);
  });

  static exportCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const search = req.query.search as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const bills = await PurchasesService.getExportData(req.businessId!, {
      search,
      status,
      startDate,
      endDate,
    });

    const columns = [
      { header: 'Bill No', key: 'billNumber' },
      { header: 'Supplier Name', key: 'supplierSnapshot.name' },
      { header: 'Supplier Phone', key: 'supplierSnapshot.phone' },
      { header: 'Supplier GSTIN', key: 'supplierSnapshot.gstin' },
      { header: 'Bill Date', key: 'billDate' },
      { header: 'Due Date', key: 'dueDate' },
      { header: 'Status', key: 'status' },
      { header: 'Subtotal', format: (b: any) => minorToMajor(b.subtotalMinor || 0) },
      { header: 'Total Tax', format: (b: any) => minorToMajor(b.totalTaxMinor || 0) },
      { header: 'Grand Total', format: (b: any) => minorToMajor(b.grandTotalMinor || 0) },
      { header: 'Paid Amount', format: (b: any) => minorToMajor(b.paidAmountMinor || 0) },
      { header: 'Due Amount', format: (b: any) => minorToMajor(b.dueAmountMinor || 0) },
      { header: 'Notes', key: 'notes' },
    ];

    const csv = generateCsv(columns, bills);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `purchases_${dateStr}.csv`, csv);
  });
}
