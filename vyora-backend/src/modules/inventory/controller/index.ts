import { Response } from 'express';
import { InventoryService } from '../service';
import { asyncHandler, ApiResponse } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class InventoryController {
  static adjustStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId, quantityDelta, reason } = req.body;
    const result = await InventoryService.manualAdjustment(
      req.businessId!,
      productId,
      quantityDelta,
      reason,
      req.user!.id,
    );
    return ApiResponse.created(res, result);
  });

  static getMovements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
    const productId = req.query.productId as string | undefined;

    const result = await InventoryService.getAllMovements(req.businessId!, {
      productId,
      limit,
      skip,
    });
    return ApiResponse.success(res, result);
  });

  static getLedger = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const result = await InventoryService.getProductLedger(
      req.businessId!,
      req.params.productId as string,
      limit,
    );
    return ApiResponse.success(res, result);
  });
}
