import { Response } from 'express';
import { BackupService } from '../service';
import { ApiResponse, asyncHandler } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class BackupController {
  static export = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const backupBundle = await BackupService.exportTenantBackup(req.businessId!);
    return ApiResponse.success(res, backupBundle);
  });
}
