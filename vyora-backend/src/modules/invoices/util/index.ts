import { IInvoice } from '../model';

export function buildBusinessSnapshot(business: any) {
  return {
    name: business.name,
    legalName: business.legalName,
    phone: business.phone,
    email: business.email,
    gstin: business.gstin,
    address: `${business.addressLine1}${business.addressLine2 ? ', ' + business.addressLine2 : ''}`,
    city: business.city,
    state: business.state,
    pincode: business.pincode,
    upiId: business.upiId || '',
  };
}

export function buildCustomerSnapshot(customer: any) {
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    gstin: customer.gstin,
    address: `${customer.billingAddress.line1}, ${customer.billingAddress.city}`,
    state: customer.billingAddress.state,
    stateCode: customer.billingAddress.stateCode,
  };
}

export function mapInvoiceDocument(doc: IInvoice) {
  return {
    id: doc._id.toString(),
    _id: doc._id.toString(),
    businessId: doc.businessId,
    invoiceNumber: doc.invoiceNumber,
    status: doc.status,
    customerId: doc.customerId,
    customerSnapshot: doc.customerSnapshot,
    businessSnapshot: doc.businessSnapshot,
    issueDate: doc.issueDate,
    dueDate: doc.dueDate,
    isInterState: doc.isInterState,
    items: doc.items,
    subtotalMinor: doc.subtotalMinor,
    totalDiscountMinor: doc.totalDiscountMinor,
    totalTaxableAmountMinor: doc.totalTaxableAmountMinor,
    cgstMinor: doc.cgstMinor,
    sgstMinor: doc.sgstMinor,
    igstMinor: doc.igstMinor,
    totalTaxMinor: doc.totalTaxMinor,
    roundOffMinor: doc.roundOffMinor,
    grandTotalMinor: doc.grandTotalMinor,
    paidAmountMinor: doc.paidAmountMinor,
    dueAmountMinor: doc.dueAmountMinor,
    notes: doc.notes,
    terms: doc.terms,
    cancelReason: doc.cancelReason,
    cancelledAt: doc.cancelledAt,
    createdAt: (doc as any).createdAt,
    updatedAt: (doc as any).updatedAt,
  };
}
