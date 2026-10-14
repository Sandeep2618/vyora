import { Response } from 'express';
import { PaymentsService } from '../service';
import { ApiResponse, asyncHandler } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class PaymentsController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payment = await PaymentsService.create(
      req.businessId!,
      req.body,
      req.user!.id,
      req.user!.name,
    );
    return ApiResponse.created(res, payment);
  });

  static findAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const partyId = req.query.partyId as string | undefined;
    const invoiceId = req.query.invoiceId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    const result = await PaymentsService.findAll(req.businessId!, {
      partyId,
      invoiceId,
      limit,
      skip,
    });
    return ApiResponse.success(res, result);
  });

  static findOne = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payment = await PaymentsService.findOne(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, payment);
  });
}
