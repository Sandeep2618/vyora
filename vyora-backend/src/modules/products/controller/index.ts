import { Response } from 'express';
import { ProductsService } from '../service';
import { asyncHandler, ApiResponse } from '../../../util';
import { AuthenticatedRequest, parsePagingQuery } from '../../../common';

export class ProductsController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProductsService.create(req.businessId!, req.body, req.user!.id);
    return ApiResponse.created(res, result);
  });

  static findAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit, skip, search } = parsePagingQuery(req);
    const lowStockOnly = req.query.lowStockOnly === 'true' || req.body?.lowStockOnly === true;

    const result = await ProductsService.findAll(req.businessId!, {
      search,
      lowStockOnly,
      limit,
      skip,
    });
    return ApiResponse.paginated(res, result.items, result.total, limit, skip);
  });

  static findOne = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProductsService.findOne(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, result);
  });

  static update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProductsService.update(req.businessId!, req.params.id as string, req.body);
    return ApiResponse.success(res, result);
  });

  static delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProductsService.delete(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, result);
  });
}
