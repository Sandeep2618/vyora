import { Response } from 'express';
import { PartiesService } from '../service';
import { asyncHandler, ApiResponse, generateCsv, sendCsvResponse, minorToMajor } from '../../../util';
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
    const result = await PartiesService.delete(req.businessId!, req.params.id as string, req.user?.id);
    return ApiResponse.success(res, result);
  });

  static exportCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const type = req.query.type as PartyType;
    const search = req.query.search as string;

    const parties = await PartiesService.getExportData(req.businessId!, {
      type,
      search,
    });

    const columns = [
      { header: 'Party Name', key: 'name' },
      { header: 'Type', key: 'type' },
      { header: 'Contact Person', key: 'contactPerson' },
      { header: 'Phone', key: 'phone' },
      { header: 'Email', key: 'email' },
      { header: 'GSTIN', key: 'gstin' },
      { header: 'PAN', key: 'pan' },
      { header: 'City', key: 'billingAddress.city' },
      { header: 'State', key: 'billingAddress.state' },
      { header: 'Pincode', key: 'billingAddress.pincode' },
      { header: 'Current Balance', format: (p: any) => minorToMajor(p.currentBalanceMinor || 0) },
      { header: 'Opening Balance', format: (p: any) => minorToMajor(p.openingBalanceMinor || 0) },
    ];

    const csv = generateCsv(columns, parties);
    const dateStr = new Date().toISOString().split('T')[0];
    const filenamePrefix = type ? type.toLowerCase() : 'parties';
    return sendCsvResponse(res, `${filenamePrefix}_${dateStr}.csv`, csv);
  });
}
