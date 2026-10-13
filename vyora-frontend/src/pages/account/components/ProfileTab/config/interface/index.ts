export interface ProfileFormData {
  name: string;
  legalName?: string;
  phone: string;
  email: string;
  gstin?: string;
  pan?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  invoicePrefix: string;
  invoiceNumberPadding: number;
  purchasePrefix: string;
  termsAndConditions?: string;
}
