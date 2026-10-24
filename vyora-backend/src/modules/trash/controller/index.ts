import { Response } from 'express';
import { TrashService } from '../service';
import { ApiResponse, asyncHandler } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class TrashController {
  static list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = req.query.category as string | undefined;
    const items = await TrashService.listTrash(req.businessId!, category);
    return ApiResponse.success(res, items);
  });

  static restore = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { category, id, restoreCustomer } = req.body;
    const result = await TrashService.restoreItem(
      req.businessId!,
      category,
      id,
      req.user?.id,
      { restoreCustomer },
    );
    return ApiResponse.success(res, result);
  });

  static restoreBatch = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { items } = req.body;
    const result = await TrashService.restoreBatch(
      req.businessId!,
      items,
      req.user?.id,
    );
    return ApiResponse.success(res, result);
  });
}
