import { Response } from 'express';
import { AuditService } from '../service';
import { asyncHandler, ApiResponse } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class AuditController {
  static getLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    const result = await AuditService.getLogs(req.businessId!, limit, skip);
    return ApiResponse.success(res, result);
  });
}
