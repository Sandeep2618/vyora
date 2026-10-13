import { PaymentMethod } from './payment';

// Expense Domain Types
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
