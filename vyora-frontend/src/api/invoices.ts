import { api } from '../lib/api';
import { Invoice, CreateInvoiceInput, InvoiceTotals, CalculatedLineItem } from '../types';

export interface InvoiceListParams {
  status?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface InvoiceListResponse {
  items: Invoice[];
  total: number;
  limit: number;
  skip: number;
}

export interface InvoicePreviewResponse {
  lines: CalculatedLineItem[];
  totals: InvoiceTotals;
}

export const invoicesApi = {
  list: (params: InvoiceListParams = {}): Promise<InvoiceListResponse> => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.skip) query.set('skip', params.skip.toString());
    const qs = query.toString();
    return api.get<InvoiceListResponse>(`/invoices${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string): Promise<Invoice> => {
    return api.get<Invoice>(`/invoices/${id}`);
  },

  preview: (dto: CreateInvoiceInput): Promise<InvoicePreviewResponse> => {
    return api.post<InvoicePreviewResponse>('/invoices/preview', dto);
  },

  create: (dto: CreateInvoiceInput): Promise<Invoice> => {
    return api.post<Invoice>('/invoices', dto);
  },

  finalize: (id: string): Promise<Invoice> => {
    return api.post<Invoice>(`/invoices/${id}/finalize`);
  },

  cancel: (id: string, reason: string): Promise<Invoice> => {
    return api.post<Invoice>(`/invoices/${id}/cancel`, { reason });
  },
};
