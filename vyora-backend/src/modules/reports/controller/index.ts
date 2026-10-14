import { Response } from 'express';
import { ReportsService } from '../service';
import { ApiResponse, asyncHandler } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class ReportsController {
  static getSalesRegister = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getSalesRegister(req.businessId!, startDate, endDate);
    return ApiResponse.success(res, result);
  });

  static getPurchaseRegister = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getPurchaseRegister(req.businessId!, startDate, endDate);
    return ApiResponse.success(res, result);
  });

  static getStockSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ReportsService.getStockSummary(req.businessId!);
    return ApiResponse.success(res, result);
  });

  static getCustomerDues = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ReportsService.getCustomerDues(req.businessId!);
    return ApiResponse.success(res, result);
  });

  static getExpenseSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getExpenseSummary(req.businessId!, startDate, endDate);
    return ApiResponse.success(res, result);
  });
}
