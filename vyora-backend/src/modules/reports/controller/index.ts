import { Response } from 'express';
import { ReportsService } from '../service';
import { ApiResponse, asyncHandler, generateCsv, sendCsvResponse, minorToMajor } from '../../../util';
import { AuthenticatedRequest } from '../../../common';

export class ReportsController {
  static getSalesRegister = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getSalesRegister(req.businessId!, startDate, endDate);
    return ApiResponse.success(res, result);
  });

  static exportSalesRegisterCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getSalesRegister(req.businessId!, startDate, endDate);

    const columns = [
      { header: 'Date', key: 'issueDate' },
      { header: 'Invoice No', key: 'invoiceNumber' },
      { header: 'Customer', key: 'customerName' },
      { header: 'Status', key: 'status' },
      { header: 'Taxable Amount', format: (r: any) => minorToMajor(r.taxableMinor || 0) },
      { header: 'CGST', format: (r: any) => minorToMajor(r.cgstMinor || 0) },
      { header: 'SGST', format: (r: any) => minorToMajor(r.sgstMinor || 0) },
      { header: 'IGST', format: (r: any) => minorToMajor(r.igstMinor || 0) },
      { header: 'Total Tax', format: (r: any) => minorToMajor(r.totalTaxMinor || 0) },
      { header: 'Grand Total', format: (r: any) => minorToMajor(r.grandTotalMinor || 0) },
      { header: 'Paid Amount', format: (r: any) => minorToMajor(r.paidMinor || 0) },
      { header: 'Due Amount', format: (r: any) => minorToMajor(r.dueMinor || 0) },
    ];

    const csv = generateCsv(columns, result.items);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `sales_register_${dateStr}.csv`, csv);
  });

  static getPurchaseRegister = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getPurchaseRegister(req.businessId!, startDate, endDate);
    return ApiResponse.success(res, result);
  });

  static exportPurchaseRegisterCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getPurchaseRegister(req.businessId!, startDate, endDate);

    const columns = [
      { header: 'Date', key: 'billDate' },
      { header: 'Bill No', key: 'billNumber' },
      { header: 'Supplier', key: 'supplierName' },
      { header: 'Status', key: 'status' },
      { header: 'Subtotal', format: (r: any) => minorToMajor(r.subtotalMinor || 0) },
      { header: 'Total Tax', format: (r: any) => minorToMajor(r.totalTaxMinor || 0) },
      { header: 'Grand Total', format: (r: any) => minorToMajor(r.grandTotalMinor || 0) },
    ];

    const csv = generateCsv(columns, result.items);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `purchase_register_${dateStr}.csv`, csv);
  });

  static getStockSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ReportsService.getStockSummary(req.businessId!);
    return ApiResponse.success(res, result);
  });

  static exportStockSummaryCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ReportsService.getStockSummary(req.businessId!);

    const columns = [
      { header: 'Product Name', key: 'name' },
      { header: 'SKU', key: 'sku' },
      { header: 'Unit', key: 'unit' },
      { header: 'Current Stock', key: 'currentStock' },
      { header: 'Reorder Level', key: 'reorderLevel' },
      { header: 'Cost Price', format: (r: any) => minorToMajor(r.purchasePriceMinor || 0) },
      { header: 'Selling Price', format: (r: any) => minorToMajor(r.sellingPriceMinor || 0) },
      { header: 'Stock Valuation', format: (r: any) => minorToMajor(r.valuationMinor || 0) },
      { header: 'Stock Status', format: (r: any) => (r.isLowStock ? 'LOW STOCK' : 'IN STOCK') },
    ];

    const csv = generateCsv(columns, result.items);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `stock_summary_${dateStr}.csv`, csv);
  });

  static getCustomerDues = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ReportsService.getCustomerDues(req.businessId!);
    return ApiResponse.success(res, result);
  });

  static exportCustomerDuesCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await ReportsService.getCustomerDues(req.businessId!);

    const columns = [
      { header: 'Customer Name', key: 'name' },
      { header: 'Phone', key: 'phone' },
      { header: 'Email', key: 'email' },
      { header: 'Outstanding Due', format: (r: any) => minorToMajor(r.dueMinor || 0) },
    ];

    const csv = generateCsv(columns, result.items);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `customer_dues_${dateStr}.csv`, csv);
  });

  static getExpenseSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getExpenseSummary(req.businessId!, startDate, endDate);
    return ApiResponse.success(res, result);
  });

  static exportExpenseSummaryCsv = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await ReportsService.getExpenseSummary(req.businessId!, startDate, endDate);

    const columns = [
      { header: 'Category', key: 'category' },
      { header: 'Amount', format: (r: any) => minorToMajor(r.amountMinor || 0) },
      { header: 'Percentage', format: (r: any) => `${r.percentage}%` },
    ];

    const csv = generateCsv(columns, result.byCategory);
    const dateStr = new Date().toISOString().split('T')[0];
    return sendCsvResponse(res, `expense_summary_${dateStr}.csv`, csv);
  });
}
