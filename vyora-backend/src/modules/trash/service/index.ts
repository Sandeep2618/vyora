import { InvoiceModel } from '../../invoices/model';
import { PurchaseBillModel } from '../../purchases/model';
import { ProductModel } from '../../products/model';
import { PartyModel } from '../../parties/model';
import { ExpenseRecordModel } from '../../expenses/model';
import { NotFoundError, BadRequestError } from '../../../util';

export type TrashCategory = 'INVOICE' | 'PURCHASE' | 'PRODUCT' | 'PARTY' | 'EXPENSE';

export interface TrashItem {
  id: string;
  category: TrashCategory;
  title: string;
  subtitle: string;
  amountMinor?: number;
  deletedAt: Date;
  deletedByUserId?: string;
  deleteReason?: string;
  metadata?: Record<string, any>;
}

export class TrashService {
  static async listTrash(businessId: string, requestedCategory?: string): Promise<TrashItem[]> {
    const cat = requestedCategory?.toUpperCase();
    const results: TrashItem[] = [];

    // 1. Invoices
    if (!cat || cat === 'INVOICE' || cat === 'INVOICES') {
      const invoices = await InvoiceModel.find({ businessId, isDeleted: true }).sort({ deletedAt: -1 }).lean();
      for (const inv of invoices as any[]) {
        results.push({
          id: inv._id.toString(),
          category: 'INVOICE',
          title: `Invoice #${inv.invoiceNumber}`,
          subtitle: `Customer: ${inv.customerSnapshot?.name || 'Walk-in'} • Status: ${inv.status}`,
          amountMinor: inv.grandTotalMinor,
          deletedAt: inv.deletedAt || inv.updatedAt,
          deletedByUserId: inv.deletedByUserId,
          deleteReason: inv.deleteReason,
          metadata: {
            customerId: inv.customerId,
            customerName: inv.customerSnapshot?.name,
            invoiceNumber: inv.invoiceNumber,
          },
        });
      }
    }

    // 2. Purchases
    if (!cat || cat === 'PURCHASE' || cat === 'PURCHASES') {
      const purchases = await PurchaseBillModel.find({ businessId, isDeleted: true }).sort({ deletedAt: -1 }).lean();
      for (const pur of purchases as any[]) {
        results.push({
          id: pur._id.toString(),
          category: 'PURCHASE',
          title: `Purchase Bill #${pur.billNumber}`,
          subtitle: `Supplier: ${pur.supplierSnapshot?.name || 'Supplier'}`,
          amountMinor: pur.grandTotalMinor,
          deletedAt: pur.deletedAt || pur.updatedAt,
          deletedByUserId: pur.deletedByUserId,
          deleteReason: pur.deleteReason,
          metadata: {
            supplierId: pur.supplierId,
            billNumber: pur.billNumber,
          },
        });
      }
    }

    // 3. Products
    if (!cat || cat === 'PRODUCT' || cat === 'PRODUCTS') {
      const products = await ProductModel.find({ businessId, isDeleted: true }).sort({ deletedAt: -1 }).lean();
      for (const prod of products as any[]) {
        results.push({
          id: prod._id.toString(),
          category: 'PRODUCT',
          title: prod.name,
          subtitle: `SKU: ${prod.sku} • Stock: ${prod.currentStock} ${prod.unit}`,
          amountMinor: prod.sellingPriceMinor,
          deletedAt: prod.deletedAt || prod.updatedAt,
          deletedByUserId: prod.deletedByUserId,
          metadata: {
            sku: prod.sku,
            currentStock: prod.currentStock,
          },
        });
      }
    }

    // 4. Parties
    if (!cat || cat === 'PARTY' || cat === 'PARTIES') {
      const parties = await PartyModel.find({ businessId, isDeleted: true }).sort({ deletedAt: -1 }).lean();
      for (const party of parties as any[]) {
        results.push({
          id: party._id.toString(),
          category: 'PARTY',
          title: party.name,
          subtitle: `${party.type} • Phone: ${party.phone || 'None'}`,
          amountMinor: Math.abs(party.currentBalanceMinor || 0),
          deletedAt: party.deletedAt || party.updatedAt,
          deletedByUserId: party.deletedByUserId,
          metadata: {
            partyType: party.type,
            phone: party.phone,
          },
        });
      }
    }

    // 5. Expenses
    if (!cat || cat === 'EXPENSE' || cat === 'EXPENSES') {
      const expenses = await ExpenseRecordModel.find({ businessId, isDeleted: true }).sort({ deletedAt: -1 }).lean();
      for (const exp of expenses as any[]) {
        results.push({
          id: exp._id.toString(),
          category: 'EXPENSE',
          title: exp.vendorName ? `${exp.category} (${exp.vendorName})` : exp.category,
          subtitle: `Expense #${exp.expenseNumber || 'EXP'} • Date: ${exp.expenseDate}`,
          amountMinor: exp.amountMinor,
          deletedAt: exp.deletedAt || exp.updatedAt,
          deletedByUserId: exp.deletedByUserId,
          metadata: {
            category: exp.category,
            expenseDate: exp.expenseDate,
          },
        });
      }
    }

    // Sort all trash items by deletion timestamp descending
    return results.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  }

  static async restoreItem(
    businessId: string,
    category: string,
    id: string,
    userId?: string,
    options?: { restoreCustomer?: boolean },
  ) {
    const cat = category.toUpperCase() as TrashCategory;
    let message = 'Item restored successfully';
    let restoredDependency: string | undefined;

    switch (cat) {
      case 'INVOICE': {
        const inv = await InvoiceModel.findOne({ _id: id, businessId, isDeleted: true });
        if (!inv) throw new NotFoundError('Deleted Invoice');

        // Check if associated customer is also in trash
        if (inv.customerId) {
          const customerInTrash = await PartyModel.findOne({ _id: inv.customerId, businessId, isDeleted: true });
          if (customerInTrash) {
            if (options?.restoreCustomer) {
              customerInTrash.isDeleted = false;
              customerInTrash.isArchived = false;
              await customerInTrash.save();
              restoredDependency = `Also restored customer ${customerInTrash.name}`;
            }
          }
        }

        inv.isDeleted = false;
        await inv.save();
        message = `Invoice #${inv.invoiceNumber} restored successfully`;
        break;
      }

      case 'PURCHASE': {
        const pur = await PurchaseBillModel.findOne({ _id: id, businessId, isDeleted: true });
        if (!pur) throw new NotFoundError('Deleted Purchase Bill');

        pur.isDeleted = false;
        await pur.save();
        message = `Purchase Bill #${pur.billNumber} restored successfully`;
        break;
      }

      case 'PRODUCT': {
        const prod = await ProductModel.findOne({ _id: id, businessId, isDeleted: true });
        if (!prod) throw new NotFoundError('Deleted Product');

        // Check SKU collision with an existing active product
        const existingWithSku = await ProductModel.findOne({
          businessId,
          sku: prod.sku,
          isDeleted: { $ne: true },
          _id: { $ne: prod._id },
        });

        if (existingWithSku) {
          // Resolve collision by appending suffix to avoid Mongo duplicate key crash
          prod.sku = `${prod.sku}_RESTORED`;
          message = `Product "${prod.name}" restored with SKU ${prod.sku} to avoid duplicate collision`;
        } else {
          message = `Product "${prod.name}" restored successfully`;
        }

        prod.isDeleted = false;
        prod.isArchived = false;
        await prod.save();
        break;
      }

      case 'PARTY': {
        const party = await PartyModel.findOne({ _id: id, businessId, isDeleted: true });
        if (!party) throw new NotFoundError('Deleted Party');

        party.isDeleted = false;
        party.isArchived = false;
        await party.save();
        message = `${party.type === 'CUSTOMER' ? 'Customer' : 'Supplier'} "${party.name}" restored successfully`;
        break;
      }

      case 'EXPENSE': {
        const exp = await ExpenseRecordModel.findOne({ _id: id, businessId, isDeleted: true });
        if (!exp) throw new NotFoundError('Deleted Expense');

        exp.isDeleted = false;
        await exp.save();
        message = `Expense "${exp.category}" restored successfully`;
        break;
      }

      default:
        throw new BadRequestError(`Unsupported trash category: ${category}`);
    }

    return {
      success: true,
      message,
      category: cat,
      id,
      restoredDependency,
    };
  }

  static async restoreBatch(
    businessId: string,
    items: Array<{ category: string; id: string }>,
    userId?: string,
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Please provide an array of items to restore');
    }

    const results: any[] = [];
    let restoredCount = 0;

    for (const item of items) {
      try {
        const res = await this.restoreItem(businessId, item.category, item.id, userId);
        results.push(res);
        restoredCount++;
      } catch (err: any) {
        results.push({
          success: false,
          category: item.category,
          id: item.id,
          error: err?.message || 'Restore failed',
        });
      }
    }

    return {
      success: true,
      restoredCount,
      totalRequested: items.length,
      details: results,
    };
  }
}
