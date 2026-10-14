import { Response } from 'express';
import { PartiesService } from '../service';
import { asyncHandler, ApiResponse } from '../../../util';
import { AuthenticatedRequest } from '../../../common';
import { PartyType } from '@vyora/shared-types';

export class PartiesController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await PartiesService.create(req.businessId!, req.body);
    return ApiResponse.created(res, result);
  });

  static findAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const type = req.query.type as PartyType;
    const search = req.query.search as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    const result = await PartiesService.findAll(req.businessId!, {
      type,
      search,
      limit,
      skip,
    });
    return ApiResponse.success(res, result);
  });

  static findOne = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await PartiesService.findOne(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, result);
  });

  static update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await PartiesService.update(req.businessId!, req.params.id as string, req.body);
    return ApiResponse.success(res, result);
  });

  static delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await PartiesService.delete(req.businessId!, req.params.id as string);
    return ApiResponse.success(res, result);
  });
}
