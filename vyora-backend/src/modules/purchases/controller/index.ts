import { Response } from 'express';
import { PurchasesService } from '../service';
import { ApiResponse, asyncHandler } from '../../../util';
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
}
