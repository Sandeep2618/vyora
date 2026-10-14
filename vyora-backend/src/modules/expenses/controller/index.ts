import { Response } from 'express';
import { ExpensesService } from '../service';
import { ApiResponse, asyncHandler } from '../../../util';
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
    const result = await ExpensesService.remove(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, result);
  });
}
