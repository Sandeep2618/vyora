// User and Authorization Domain Types
export type UserRole = 'OWNER' | 'STAFF' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

// Subscription Plans matching website pricing
export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise';

export interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isPrimaryOwner?: boolean;
  isActive: boolean;
  createdAt: string;
}

// Business Entity
export interface BusinessProfile {
  id: string;
  name: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  stateCode?: string; // 2 digit GST state code e.g. "27" for Maharashtra
  currency: string;   // Default "INR"
  invoicePrefix: string; // e.g. "INV-"
  invoiceNumberPadding: number; // e.g. 4 -> "0048"
  nextInvoiceNumber: number;
  purchasePrefix: string;
  nextPurchaseNumber: number;
  termsAndConditions?: string;
  subscriptionPlan?: SubscriptionPlan;
  staffPermissions?: {
    invoices?: boolean;
    parties?: boolean;
    products?: boolean;
    inventory?: boolean;
    purchases?: boolean;
    payments?: boolean;
    reports?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfileInput {
  name: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  currency?: string;
  invoicePrefix?: string;
  invoiceNumberPadding?: number;
  purchasePrefix?: string;
  termsAndConditions?: string;
}
