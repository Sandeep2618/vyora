import { Response } from 'express';
import { PaymentsService } from '../service';
import { ApiResponse, asyncHandler, generateCsv, sendCsvResponse, minorToMajor } from '../../../util';
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

  static exportCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const partyId = req.query.partyId as string | undefined;
    const type = req.query.type as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const search = req.query.search as string | undefined;

    const payments = await PaymentsService.getExportData(req.businessId!, {
      partyId,
      type,
      startDate,
      endDate,
      search,
    });

    const columns = [
      { header: 'Payment No', key: 'paymentNumber' },
      { header: 'Date', key: 'paymentDate' },
      { header: 'Party Name', key: 'partyName' },
      { header: 'Type', key: 'type' },
      { header: 'Amount', format: (p: any) => minorToMajor(p.amountMinor || 0) },
      { header: 'Payment Method', key: 'paymentMethod' },
      { header: 'Reference No', key: 'referenceNumber' },
      { header: 'Notes', key: 'notes' },
    ];

    const csv = generateCsv(columns, payments);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `payments_${dateStr}.csv`, csv);
  });
}
