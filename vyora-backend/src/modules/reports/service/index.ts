import { InvoiceModel } from '../../invoices/model';
import { PurchaseBillModel } from '../../purchases/model';
import { ProductModel } from '../../products/model';
import { PartyModel } from '../../parties/model';
import { ExpenseRecordModel } from '../../expenses/model';

export class ReportsService {
  static async getSalesRegister(
    businessId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = { businessId, status: { $ne: 'CANCELLED' } };
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = startDate;
      if (endDate) filter.issueDate.$lte = endDate;
    }

    const invoices = await InvoiceModel.find(filter)
      .sort({ issueDate: -1 })
      .lean();

    let totalTaxableMinor = 0;
    let totalTaxMinor = 0;
    let totalGrandMinor = 0;
    let totalReceivedMinor = 0;
    let totalDueMinor = 0;

    const items = invoices.map((inv: any) => {
      totalTaxableMinor += inv.totalTaxableAmountMinor || 0;
      totalTaxMinor += inv.totalTaxMinor || 0;
      totalGrandMinor += inv.grandTotalMinor || 0;
      totalReceivedMinor += inv.paidAmountMinor || 0;
      totalDueMinor += inv.dueAmountMinor || 0;

      return {
        id: inv._id.toString(),
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerSnapshot?.name || 'Customer',
        issueDate: inv.issueDate,
        status: inv.status,
        taxableMinor: inv.totalTaxableAmountMinor,
        cgstMinor: inv.cgstMinor,
        sgstMinor: inv.sgstMinor,
        igstMinor: inv.igstMinor,
        totalTaxMinor: inv.totalTaxMinor,
        grandTotalMinor: inv.grandTotalMinor,
        paidMinor: inv.paidAmountMinor,
        dueMinor: inv.dueAmountMinor,
      };
    });

    return {
      items,
      summary: {
        totalInvoices: items.length,
        totalTaxableMinor,
        totalTaxMinor,
        totalGrandMinor,
        totalReceivedMinor,
        totalDueMinor,
      },
    };
  }

  static async getPurchaseRegister(
    businessId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = { businessId };
    if (startDate || endDate) {
      filter.billDate = {};
      if (startDate) filter.billDate.$gte = startDate;
      if (endDate) filter.billDate.$lte = endDate;
    }

    const purchases = await PurchaseBillModel.find(filter)
      .sort({ billDate: -1 })
      .lean();

    let totalSubtotalMinor = 0;
    let totalTaxMinor = 0;
    let totalGrandMinor = 0;

    const items = purchases.map((p: any) => {
      totalSubtotalMinor += p.subtotalMinor || 0;
      totalTaxMinor += p.totalTaxMinor || 0;
      totalGrandMinor += p.grandTotalMinor || 0;

      return {
        id: p._id.toString(),
        billNumber: p.billNumber,
        supplierName: p.supplierSnapshot?.name || 'Supplier',
        billDate: p.billDate,
        status: p.status,
        subtotalMinor: p.subtotalMinor,
        totalTaxMinor: p.totalTaxMinor,
        grandTotalMinor: p.grandTotalMinor,
      };
    });

    return {
      items,
      summary: {
        totalBills: items.length,
        totalSubtotalMinor,
        totalTaxMinor,
        totalGrandMinor,
      },
    };
  }

  static async getStockSummary(businessId: string) {
    const products = await ProductModel.find({ businessId, isArchived: false })
      .sort({ name: 1 })
      .lean();

    let totalStockQty = 0;
    let totalValuationMinor = 0;

    const items = products.map((prod: any) => {
      const stock = Math.max(0, prod.currentStock);
      const unitCost = prod.purchasePriceMinor > 0 ? prod.purchasePriceMinor : prod.sellingPriceMinor;
      const valuation = stock * unitCost;

      totalStockQty += stock;
      totalValuationMinor += valuation;

      return {
        id: prod._id.toString(),
        name: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        currentStock: prod.currentStock,
        reorderLevel: prod.reorderLevel,
        purchasePriceMinor: prod.purchasePriceMinor,
        sellingPriceMinor: prod.sellingPriceMinor,
        valuationMinor: valuation,
        isLowStock: prod.currentStock <= prod.reorderLevel,
      };
    });

    return {
      items,
      summary: {
        totalProducts: items.length,
        totalStockQty,
        totalValuationMinor,
      },
    };
  }

  static async getCustomerDues(businessId: string) {
    const customers = await PartyModel.find({
      businessId,
      type: { $in: ['CUSTOMER', 'BOTH'] },
      isArchived: false,
      currentBalanceMinor: { $gt: 0 },
    })
      .sort({ currentBalanceMinor: -1 })
      .lean();

    let totalDueMinor = 0;

    const items = customers.map((c: any) => {
      totalDueMinor += c.currentBalanceMinor;
      return {
        id: c._id.toString(),
        name: c.name,
        phone: c.phone,
        email: c.email,
        dueMinor: c.currentBalanceMinor,
        creditLimitMinor: c.creditLimitMinor,
      };
    });

    return {
      items,
      summary: {
        totalDebtors: items.length,
        totalDueMinor,
      },
    };
  }

  static async getExpenseSummary(businessId: string, startDate?: string, endDate?: string) {
    const filter: any = { businessId };
    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) filter.expenseDate.$gte = startDate;
      if (endDate) filter.expenseDate.$lte = endDate;
    }

    const expenses = await ExpenseRecordModel.find(filter).lean();

    const categoryMap = new Map<string, number>();
    let totalExpenseMinor = 0;

    for (const exp of expenses) {
      totalExpenseMinor += exp.amountMinor;
      categoryMap.set(
        exp.category,
        (categoryMap.get(exp.category) || 0) + exp.amountMinor,
      );
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, amountMinor]) => ({
      category,
      amountMinor,
      percentage: totalExpenseMinor > 0 ? Math.round((amountMinor / totalExpenseMinor) * 100) : 0,
    }));

    return {
      totalExpenseMinor,
      totalCount: expenses.length,
      byCategory,
    };
  }
}
