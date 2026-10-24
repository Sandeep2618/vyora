import { Response } from 'express';
import { AuthenticatedRequest } from '../../../common';
import { ReturnsService } from '../service';
import { asyncHandler, ApiResponse } from '../../../util';

export class ReturnsController {
  static createInvoiceReturn = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessId = req.businessId!;
    const invoiceId = String(req.params.id);
    const result = await ReturnsService.createCreditNote(businessId, invoiceId, req.body, req.user?.id);
    return ApiResponse.success(res, result, 201);
  });

  static getInvoiceReturns = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessId = req.businessId!;
    const invoiceId = String(req.params.id);
    const result = await ReturnsService.getInvoiceCreditNotes(businessId, invoiceId);
    return ApiResponse.success(res, result);
  });

  static createPurchaseReturn = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessId = req.businessId!;
    const purchaseBillId = String(req.params.id);
    const result = await ReturnsService.createDebitNote(businessId, purchaseBillId, req.body, req.user?.id);
    return ApiResponse.success(res, result, 201);
  });

  static getPurchaseReturns = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessId = req.businessId!;
    const purchaseBillId = String(req.params.id);
    const result = await ReturnsService.getPurchaseDebitNotes(businessId, purchaseBillId);
    return ApiResponse.success(res, result);
  });
}
