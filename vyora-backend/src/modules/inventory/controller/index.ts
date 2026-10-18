import { Response } from 'express';
import { InventoryService } from '../service';
import { asyncHandler, ApiResponse, generateCsv, sendCsvResponse } from '../../../util';
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

  static exportCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const productId = req.query.productId as string | undefined;
    const movementType = req.query.movementType as string | undefined;
    const search = req.query.search as string | undefined;

    const items = await InventoryService.getExportData(req.businessId!, {
      productId,
      movementType,
      search,
    });

    const columns = [
      { header: 'Date', format: (m: any) => (m.createdAt ? new Date(m.createdAt).toLocaleString('en-IN') : '') },
      { header: 'Product Name', key: 'productName' },
      { header: 'SKU', key: 'sku' },
      { header: 'Unit', key: 'unit' },
      { header: 'Movement Type', key: 'movementType' },
      { header: 'Quantity Change', key: 'quantityDelta' },
      { header: 'Stock After', key: 'balanceAfter' },
      { header: 'Reference Type', key: 'referenceType' },
      { header: 'Reason', key: 'reason' },
    ];

    const csv = generateCsv(columns, items);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `inventory_movements_${dateStr}.csv`, csv);
  });
}
