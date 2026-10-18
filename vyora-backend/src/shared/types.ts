// User and Authorization
export type UserRole = 'OWNER' | 'STAFF' | 'ADMIN' | 'CUSTOMER';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  businessId?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export type SubscriptionPlan = 'starter' | 'free' | 'growth' | 'enterprise';
export type SubscriptionTier = SubscriptionPlan;

export interface UserPersonas {
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  activeRole: UserRole;
  activeBusinessId?: string;
  ownedBusinesses: Array<{ id: string; name: string; role: 'OWNER' }>;
  staffBusinesses: Array<{ id: string; name: string; role: 'STAFF'; permissions: string[] }>;
  customerShops: Array<{ businessId: string; shopName: string; shopPhone?: string; balanceMinor: number }>;
}

export interface UserWorkspace {
  id: string;
  businessId: string;
  membershipId: string;
  name: string;
  phone?: string;
  city?: string;
  role: UserRole;
  roleName: string;
  isCurrent: boolean;
  status: 'PENDING' | 'ACTIVE';
  joinedAt: string;
}

// Business Entity
export interface BusinessProfile {
  id: string;
  name: string;
  legalName?: string;
  logoUrl?: string;
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
  createdAt: string;
  updatedAt: string;
}

// Party (Customer / Supplier)
export type PartyType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH';

export interface Party {
  id: string;
  businessId: string;
  type: PartyType;
  name: string;
  contactPerson?: string;
  phone?: string;
  isWalkIn?: boolean;
  email?: string;
  gstin?: string;
  pan?: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    stateCode?: string;
    pincode: string;
  };
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    stateCode?: string;
    pincode: string;
  };
  openingBalanceMinor: number; // in minor units (paise)
  currentBalanceMinor: number;
  creditLimitMinor?: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product / Item
export type TaxRatePercent = 0 | 5 | 12 | 18 | 28;
export type ItemUnit = 'PCS' | 'BOX' | 'KG' | 'LTR' | 'MTR' | 'SET' | 'UNT' | 'PKT';

export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  hsnCode?: string;
  description?: string;
  unit: ItemUnit;
  sellingPriceMinor: number;
  purchasePriceMinor: number;
  taxRatePercent: TaxRatePercent;
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Stock Movement
export type StockMovementType =
  | 'OPENING'
  | 'SALE'
  | 'PURCHASE'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'SALE_CANCEL'
  | 'PURCHASE_CANCEL';

export interface StockMovement {
  id: string;
  businessId: string;
  productId: string;
  movementType: StockMovementType;
  quantityDelta: number; // + for inward, - for outward
  resultingStock: number;
  reason?: string;
  referenceType: 'INVOICE' | 'PURCHASE' | 'MANUAL_ADJUSTMENT' | 'INITIAL_SETUP';
  referenceId?: string;
  performedByUserId: string;
  createdAt: string;
}

// Invoices
export type InvoiceStatus =
  | 'DRAFT'
  | 'FINALIZED'
  | 'PAID'
  | 'PARTIAL'
  | 'UNPAID'
  | 'CANCELLED';

export interface InvoiceItemLine {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  hsnCode?: string;
  unit: ItemUnit;
  quantity: number;
  unitPriceMinor: number;
  discountPercent: number;
  discountAmountMinor: number;
  taxableAmountMinor: number;
  taxRatePercent: TaxRatePercent;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  lineTotalMinor: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerId: string;
  customerSnapshot: {
    name: string;
    phone: string;
    email?: string;
    gstin?: string;
    address: string;
    state: string;
    stateCode?: string;
  };
  businessSnapshot?: {
    name: string;
    legalName?: string;
    phone: string;
    email: string;
    gstin?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  isInterState: boolean;
  items: InvoiceItemLine[];
  subtotalMinor: number;
  totalDiscountMinor: number;
  totalTaxableAmountMinor: number;
  cgstMinor: number;
  sgstMinor: number;
  igstMinor: number;
  totalTaxMinor: number;
  roundOffMinor: number;
  grandTotalMinor: number;
  paidAmountMinor: number;
  dueAmountMinor: number;
  notes?: string;
  terms?: string;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

// Purchases
export type PurchaseStatus = 'RECEIVED' | 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED';

export interface PurchaseItemLine {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  unit: ItemUnit;
  quantity: number;
  unitPriceMinor: number;
  taxRatePercent: TaxRatePercent;
  taxableAmountMinor: number;
  totalTaxMinor: number;
  lineTotalMinor: number;
}

export interface PurchaseBill {
  id: string;
  businessId: string;
  billNumber: string;
  supplierId: string;
  supplierSnapshot: {
    name: string;
    phone: string;
    gstin?: string;
    state?: string;
  };
  billDate: string;
  dueDate?: string;
  status: PurchaseStatus;
  items: PurchaseItemLine[];
  subtotalMinor: number;
  totalTaxMinor: number;
  grandTotalMinor: number;
  paidAmountMinor: number;
  dueAmountMinor: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Payments & Receipts
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CARD' | 'OTHER';
export type PaymentType = 'RECEIPT' | 'PAYMENT';

export interface PaymentRecord {
  id: string;
  businessId: string;
  paymentNumber: string;
  type: PaymentType;
  partyId: string;
  partyName: string;
  invoiceId?: string;
  purchaseBillId?: string;
  amountMinor: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  idempotencyKey?: string;
  receivedByUserId: string;
  createdAt: string;
}

// Expenses
export interface ExpenseCategory {
  id: string;
  businessId: string;
  name: string;
}

export interface ExpenseRecord {
  id: string;
  businessId: string;
  category: string;
  amountMinor: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  vendorName?: string;
  createdAt: string;
}

// Audit Trail
export interface AuditLogEntry {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'INVOICE' | 'PURCHASE' | 'PAYMENT' | 'STOCK' | 'PRODUCT' | 'PARTY' | 'BUSINESS';
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

// Dashboard Summary Metrics
export interface DashboardSummary {
  totalSalesMinor: number;
  totalSalesChangePercent: number;
  totalInvoicesCount: number;
  totalInvoicesChangePercent: number;
  outstandingReceivablesMinor: number;
  outstandingReceivablesChangePercent: number;
  totalStockValueMinor: number;
  totalStockValueChangePercent: number;
  recentInvoices: {
    id: string;
    invoiceNumber: string;
    customerName: string;
    date: string;
    amountMinor: number;
    status: InvoiceStatus;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    soldQuantity: number;
    revenueMinor: number;
  }[];
  salesTrend: {
    date: string;
    salesMinor: number;
  }[];
  salesByCategory: {
    categoryName: string;
    salesMinor: number;
    percentage: number;
  }[];
  lowStockCount: number;
}
