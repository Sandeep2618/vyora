import { BusinessModel } from '../../business/model';
import { ProductModel } from '../../products/model';
import { PartyModel } from '../../parties/model';
import { InvoiceModel } from '../../invoices/model';
import { PurchaseBillModel } from '../../purchases/model';
import { ExpenseRecordModel } from '../../expenses/model';
import { NotFoundError } from '../../../util';

export class BackupService {
  static async exportTenantBackup(businessId: string) {
    const business = await BusinessModel.findById(businessId).lean();
    if (!business) {
      throw new NotFoundError('Business');
    }

    const [products, parties, invoices, purchases, expenses] = await Promise.all([
      ProductModel.find({ businessId, isDeleted: { $ne: true } }).lean(),
      PartyModel.find({ businessId, isDeleted: { $ne: true } }).lean(),
      InvoiceModel.find({ businessId, isDeleted: { $ne: true } }).lean(),
      PurchaseBillModel.find({ businessId, isDeleted: { $ne: true } }).lean(),
      ExpenseRecordModel.find({ businessId, isDeleted: { $ne: true } }).lean(),
    ]);

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      business: {
        id: business._id.toString(),
        name: business.name,
        legalName: business.legalName,
        phone: business.phone,
        email: business.email,
        gstin: business.gstin,
        pan: business.pan,
        addressLine1: business.addressLine1,
        city: business.city,
        state: business.state,
        pincode: business.pincode,
        currency: business.currency,
        invoicePrefix: business.invoicePrefix,
        bankName: business.bankName,
        bankAccountNumber: business.bankAccountNumber,
        bankIfsc: business.bankIfsc,
        termsAndConditions: business.termsAndConditions,
      },
      summary: {
        totalProducts: products.length,
        totalParties: parties.length,
        totalInvoices: invoices.length,
        totalPurchases: purchases.length,
        totalExpenses: expenses.length,
      },
      data: {
        products,
        parties,
        invoices,
        purchases,
        expenses,
      },
    };
  }
}
