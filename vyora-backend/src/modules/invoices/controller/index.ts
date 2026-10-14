import { Response } from 'express';
import { InvoicesService } from '../service';
import { asyncHandler, ApiResponse } from '../../../util';
import { AuthenticatedRequest } from '../../../common';
import { InvoiceStatus } from '@vyora/shared-types';

export class InvoicesController {
  static preview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await InvoicesService.previewInvoice(req.businessId!, req.body);
    return ApiResponse.success(res, result);
  });

  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await InvoicesService.create(req.businessId!, req.body, req.user!.id);
    return ApiResponse.created(res, result);
  });

  static findAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const customerId = req.query.customerId as string;
    const status = req.query.status as InvoiceStatus;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    const result = await InvoicesService.findAll(req.businessId!, {
      customerId,
      status,
      startDate,
      endDate,
      limit,
      skip,
    });
    return ApiResponse.success(res, result);
  });

  static findOne = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await InvoicesService.findOne(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, result);
  });

  static finalize = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await InvoicesService.finalizeInvoice(req.businessId!, req.params.id as string, req.user!.id);
    return ApiResponse.success(res, result);
  });

  static cancel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await InvoicesService.cancelInvoice(
      req.businessId!,
      req.params.id as string,
      req.body,
      req.user!.id,
    );
    return ApiResponse.success(res, result);
  });
}
