import { api } from '../lib/api';
import { ExpenseRecord, PaymentMethod } from '../types';

export interface CreateExpensePayload {
  category: string;
  amountMinor: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  vendorName?: string;
}

export interface ExpenseCategoryBreakdown {
  name: string;
  totalAmountMinor: number;
  count: number;
}

export interface ExpenseBreakdown {
  grandTotalMinor: number;
  categories: ExpenseCategoryBreakdown[];
}

export const expensesApi = {
  list: async (params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ items: ExpenseRecord[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.skip) query.append('skip', String(params.skip));

    const qs = query.toString();
    const url = `/expenses${qs ? `?${qs}` : ''}`;
    const res = await api.get<any>(url);

    if (Array.isArray(res)) {
      return { items: res, total: res.length };
    }
    return {
      items: res?.items || [],
      total: res?.total || (res?.items || []).length,
    };
  },

  create: async (payload: CreateExpensePayload): Promise<ExpenseRecord> => {
    return api.post<ExpenseRecord>('/expenses', payload);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return api.delete<{ success: boolean }>(`/expenses/${id}`);
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get<string[]>('/expenses/categories');
    return Array.isArray(res) ? res : [];
  },
};
