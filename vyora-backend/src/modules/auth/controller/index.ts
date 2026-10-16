import { Response } from 'express';
import { AuthService } from '../service';
import { asyncHandler, ApiResponse } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class AuthController {
  static register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.register(req.body);
    return ApiResponse.created(res, result);
  });

  static login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result);
  });

  static sendOtp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.sendOtp(req.body);
    return ApiResponse.success(res, result);
  });

  static verifyOtp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.verifyOtp(req.body);
    return ApiResponse.success(res, result);
  });

  static getPersonas = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.getPersonas(req.user!.id);
    return ApiResponse.success(res, result);
  });

  static selectContext = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.selectContext(req.user!.id, req.body);
    return ApiResponse.success(res, result);
  });

  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.getProfile(req.user!.id);
    return ApiResponse.success(res, result);
  });

  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.updateProfile(req.user!.id, req.body);
    return ApiResponse.success(res, result);
  });

  static getMyBusinesses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.getMyBusinesses(req.user!.id);
    return ApiResponse.success(res, result);
  });

  static switchBusiness = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.switchBusiness(req.user!.id, req.body.businessId);
    return ApiResponse.success(res, result);
  });

  static acceptInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.acceptInvite(req.user!.id, req.body.businessId);
    return ApiResponse.success(res, result);
  });

  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    return ApiResponse.success(res, { success: true, message: 'Logged out successfully' });
  });
}
