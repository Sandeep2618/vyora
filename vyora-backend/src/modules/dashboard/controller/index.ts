import { Response } from 'express';
import { DashboardService } from '../service';
import { ApiResponse, asyncHandler } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class DashboardController {
  static getMetrics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const metrics = await DashboardService.getMetrics(req.businessId!);
    return ApiResponse.success(res, metrics);
  });
}
