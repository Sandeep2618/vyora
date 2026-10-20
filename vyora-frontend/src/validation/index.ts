import { z } from 'zod';

// Auth Validation
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  emailOrPhone: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Business Profile & Defaults Validation
export const BusinessProfileSchema = z.object({
  name: z.string().min(2, 'Business name is required'),
  legalName: z.string().optional(),
  upiId: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format (e.g. mobile@upi or name@bankhandle)')
    .optional()
    .or(z.literal('')),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional()
    .or(z.literal('')),
  pan: z.string().optional(),
  addressLine1: z.string().min(3, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  stateCode: z.string().length(2, '2-digit state code required (e.g. 27)').optional(),
  pincode: z.string().min(4, 'Valid pincode required'),
  currency: z.string().default('INR'),
  invoicePrefix: z.string().min(1).default('INV-'),
  invoiceNumberPadding: z.number().int().min(1).max(8).default(4),
  termsAndConditions: z.string().optional(),
});
export type BusinessProfileInput = z.infer<typeof BusinessProfileSchema>;

export const INDIAN_GST_STATE_MAP: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

// Party (Customer / Supplier) Validation
export const PartyBaseSchema = z.object({
  type: z.enum(['CUSTOMER', 'SUPPLIER', 'BOTH']),
  name: z.string().min(2, 'Party name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().trim().optional().or(z.literal('')),
  isWalkIn: z.boolean().optional().default(false),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional()
    .or(z.literal('')),
  pan: z.string().optional(),
  billingAddress: z
    .object({
      line1: z.string().optional().default(''),
      line2: z.string().optional(),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      stateCode: z.string().optional(),
      pincode: z.string().optional().default(''),
    })
    .optional()
    .default({}),
  shippingAddress: z
    .object({
      line1: z.string().optional().default(''),
      line2: z.string().optional(),
      city: z.string().optional().default(''),
      state: z.string().optional().default(''),
      stateCode: z.string().optional(),
      pincode: z.string().optional().default(''),
    })
    .optional(),
  openingBalanceMinor: z.number().int().default(0),
  creditLimitMinor: z.number().int().optional(),
});

export const PartySchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  const input = { ...val };

  // Handle flat address input from quick modals
  if (!input.billingAddress) {
    input.billingAddress = {
      line1: input.address || input.line1 || '',
      city: input.city || '',
      state: input.state || '',
      pincode: input.pincode || '',
    };
  } else {
    input.billingAddress = {
      line1: input.billingAddress.line1 || input.address || input.line1 || '',
      line2: input.billingAddress.line2 || '',
      city: input.billingAddress.city || input.city || '',
      state: input.billingAddress.state || input.state || '',
      stateCode: input.billingAddress.stateCode || '',
      pincode: input.billingAddress.pincode || input.pincode || '',
    };
  }

  // Auto-infer state from GSTIN if state is blank or missing
  if (
    input.gstin &&
    typeof input.gstin === 'string' &&
    input.gstin.length >= 2
  ) {
    const gstCode = input.gstin.substring(0, 2);
    if (INDIAN_GST_STATE_MAP[gstCode]) {
      if (!input.billingAddress.state || !input.billingAddress.state.trim()) {
        input.billingAddress.state = INDIAN_GST_STATE_MAP[gstCode];
      }
      if (!input.billingAddress.stateCode) {
        input.billingAddress.stateCode = gstCode;
      }
    }
  }

  return input;
}, PartyBaseSchema);
export type PartyInput = z.infer<typeof PartyBaseSchema>;

// Product Validation
export const ProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  hsnCode: z.string().optional(),
  description: z.string().optional(),
  unit: z.enum(['PCS', 'BOX', 'KG', 'LTR', 'MTR', 'SET', 'UNT', 'PKT']).default('PCS'),
  sellingPriceMinor: z.number().int().nonnegative('Selling price must be >= 0'),
  purchasePriceMinor: z.number().int().nonnegative('Purchase price must be >= 0').optional().default(0),
  taxRatePercent: z.union([
    z.literal(0),
    z.literal(5),
    z.literal(12),
    z.literal(18),
    z.literal(28),
  ]),
  openingStock: z.number().nonnegative('Opening stock cannot be negative').default(0),
  reorderLevel: z.number().nonnegative('Reorder level cannot be negative').default(5),
});
export type ProductInput = z.infer<typeof ProductSchema>;

// Invoice Line Item Validation
export const InvoiceItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPriceMinor: z.number().int().nonnegative('Rate cannot be negative'),
  discountPercent: z.number().min(0).max(100).default(0),
  taxRatePercent: z.union([
    z.literal(0),
    z.literal(5),
    z.literal(12),
    z.literal(18),
    z.literal(28),
  ]),
});

// Sales Invoice Creation / Update Validation
export const CreateInvoiceBaseSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  isInterState: z.boolean().optional().default(false),
  items: z.array(InvoiceItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  roundOff: z.boolean().optional().default(true),
  finalize: z.boolean().optional().default(false),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD', 'OTHER']).optional(),
  paidAmountMinor: z.number().int().nonnegative().optional(),
});

export const CreateInvoiceSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  const input = { ...val };
  if (!input.items && Array.isArray(input.lines)) {
    input.items = input.lines.map((l: any) => ({
      productId: l.productId,
      quantity: typeof l.quantity === 'number' ? l.quantity : Number(l.quantity) || 1,
      unitPriceMinor:
        l.unitPriceMinor !== undefined
          ? (typeof l.unitPriceMinor === 'number' ? l.unitPriceMinor : Number(l.unitPriceMinor))
          : (l.rateMajor ? Math.round(Number(l.rateMajor) * 100) : 0),
      discountPercent: l.discountPercent ? Number(l.discountPercent) : 0,
      taxRatePercent: l.taxRatePercent !== undefined ? Number(l.taxRatePercent) : 18,
    }));
  }
  if (!input.issueDate && input.date) {
    input.issueDate = input.date;
  }
  if (!input.issueDate) {
    input.issueDate = new Date().toISOString().split('T')[0];
  }
  if (!input.dueDate) {
    input.dueDate = input.issueDate;
  }
  if (input.finalize === undefined && input.finalizeImmediately !== undefined) {
    input.finalize = Boolean(input.finalizeImmediately);
  }
  if (!input.paymentMethod && (input.paymentMode || input.paymentMethodOption)) {
    input.paymentMethod = input.paymentMode || input.paymentMethodOption;
  }
  if (input.paymentMethod && input.finalize === undefined) {
    input.finalize = true;
  }
  return input;
}, CreateInvoiceBaseSchema);
export type CreateInvoiceInput = z.input<typeof CreateInvoiceBaseSchema>;

export const CancelInvoiceSchema = z.object({
  reason: z.string().min(3, 'A cancellation reason is required for audit tracking'),
});
export type CancelInvoiceInput = z.infer<typeof CancelInvoiceSchema>;

// Purchase Bill Validation
export const CreatePurchaseBaseSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  billNumber: z.string().min(1, 'Supplier bill number is required'),
  billDate: z.string().min(1, 'Bill date is required'),
  dueDate: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product is required'),
        quantity: z.number().positive('Quantity must be > 0'),
        unitPriceMinor: z.number().int().nonnegative('Purchase price must be >= 0'),
        taxRatePercent: z.union([
          z.literal(0),
          z.literal(5),
          z.literal(12),
          z.literal(18),
          z.literal(28),
        ]),
      }),
    )
    .min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const CreatePurchaseSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  const input = { ...val };
  if (!input.billDate && input.date) input.billDate = input.date;
  if (!input.billDate) input.billDate = new Date().toISOString().split('T')[0];
  return input;
}, CreatePurchaseBaseSchema);
export type CreatePurchaseInput = z.input<typeof CreatePurchaseBaseSchema>;

// Payment / Receipt Validation
export const CreatePaymentBaseSchema = z.object({
  type: z.enum(['RECEIPT', 'PAYMENT']),
  partyId: z.string().min(1, 'Party is required'),
  invoiceId: z.string().optional(),
  purchaseBillId: z.string().optional(),
  amountMinor: z.number().int().positive('Payment amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD', 'OTHER']),
  paymentDate: z.string().min(1, 'Payment date is required'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
});

export const CreatePaymentSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  const input = { ...val };
  if (input.type === 'PAYMENT_IN') {
    input.type = 'RECEIPT';
  } else if (input.type === 'PAYMENT_OUT') {
    input.type = 'PAYMENT';
  }
  if (!input.paymentMethod && input.paymentMode) {
    input.paymentMethod = input.paymentMode;
  }
  if (!input.paymentMethod) {
    input.paymentMethod = 'CASH';
  }
  if (!input.partyId) {
    if (input.customerId) input.partyId = input.customerId;
    else if (input.supplierId) input.partyId = input.supplierId;
  }
  if (!input.paymentDate) {
    if (input.date) input.paymentDate = input.date;
    else input.paymentDate = new Date().toISOString().split('T')[0];
  }
  if (!input.idempotencyKey) {
    input.idempotencyKey = `auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  if (!input.referenceNumber && input.reference) {
    input.referenceNumber = input.reference;
  }
  return input;
}, CreatePaymentBaseSchema);
export type CreatePaymentInput = z.input<typeof CreatePaymentBaseSchema>;

// Stock Adjustment Validation
export const StockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantityDelta: z.number().refine((val) => val !== 0, 'Quantity adjustment cannot be zero'),
  reason: z.string().min(3, 'Adjustment reason is required'),
});
export type StockAdjustmentInput = z.infer<typeof StockAdjustmentSchema>;

// Expense Validation
export const CreateExpenseSchema = z.object({
  category: z.string().min(2, 'Category is required'),
  amountMinor: z.number().int().positive('Amount must be greater than 0'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD', 'OTHER']),
  vendorName: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
