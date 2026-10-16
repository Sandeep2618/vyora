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

    const role = req.businessRole || req.user?.role;
    let items = result.items;
    if (role === 'STAFF') {
      items = items.map((p: any) => ({
        ...p,
        purchasePriceMinor: 0,
      }));
    }

    return ApiResponse.paginated(res, items, result.total, limit, skip);
  });

  static findOne = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProductsService.findOne(req.businessId!, req.params.id as string);
    const role = req.businessRole || req.user?.role;
    let product: any = result;
    if (role === 'STAFF' && product) {
      product = {
        ...product,
        purchasePriceMinor: 0,
      };
    }
    return ApiResponse.success(res, product);
  });

  static update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProductsService.update(req.businessId!, req.params.id as string, req.body);
    return ApiResponse.success(res, result);
  });

  static adjustStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { quantityDelta, reason } = req.body;
    const result = await ProductsService.adjustStock(
      req.businessId!,
      req.params.id as string,
      quantityDelta,
      reason,
      req.user?.id,
    );
    return ApiResponse.success(res, result);
  });

  static delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProductsService.delete(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, result);
  });
}
