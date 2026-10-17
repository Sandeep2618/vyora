import { Request, Response } from 'express';
import { ApiResponse, asyncHandler, BadRequestError } from '../../../util';
import { AppReleaseService } from '../service';

export class AppReleaseController {
  /**
   * Public endpoint to get the latest release notes and feature highlights.
   * Mobile app calls this to dynamically display What's New.
   */
  static getLatestRelease = asyncHandler(async (_req: Request, res: Response) => {
    const releaseInfo = await AppReleaseService.getLatestRelease();
    return ApiResponse.success(res, releaseInfo);
  });

  /**
   * Protected endpoint for store owners/admins to update or publish release notes.
   */
  static publishRelease = asyncHandler(async (req: Request, res: Response) => {
    const { version, releaseDate, channel, title, subtitle, features } = req.body;

    if (!version || !features || !Array.isArray(features)) {
      throw new BadRequestError('Version and an array of features are required.');
    }

    const created = await AppReleaseService.publishRelease({
      version,
      releaseDate,
      channel,
      title,
      subtitle,
      features,
    });

    return ApiResponse.created(res, created);
  });
}
