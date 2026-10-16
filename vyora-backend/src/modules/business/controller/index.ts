import { Response } from 'express';
import { BusinessService } from '../service';
import { asyncHandler, ApiResponse } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class BusinessController {
  static getCurrent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.getBusinessById(req.businessId!);
    return ApiResponse.success(res, result);
  });

  static updateCurrent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.updateBusiness(req.businessId!, req.body);
    return ApiResponse.success(res, result);
  });

  static updatePlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.updateSubscriptionPlan(req.businessId!, req.body.plan);
    return ApiResponse.success(res, result);
  });

  static updatePermissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.updateStaffPermissions(req.businessId!, req.body);
    return ApiResponse.success(res, result);
  });

  static getStaff = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.getStaff(req.businessId!);
    return ApiResponse.success(res, result);
  });

  static addStaff = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.addStaffMember(req.businessId!, req.body, req.user?.name);
    return ApiResponse.created(res, result);
  });

  static updateStaffRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.updateStaffRole(
      req.businessId!,
      req.params.id as string,
      req.body.role,
      req.user?.id,
    );
    return ApiResponse.success(res, result);
  });

  static toggleStaffStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.toggleStaffStatus(
      req.businessId!,
      req.params.id as string,
      req.body.isActive,
      req.user?.id,
    );
    return ApiResponse.success(res, result);
  });

  static removeStaff = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await BusinessService.removeStaffMember(
      req.businessId!,
      req.params.id as string,
      req.user?.id,
    );
    return ApiResponse.success(res, result);
  });
}
