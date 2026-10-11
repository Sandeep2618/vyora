import { api } from '../lib/api';
import { Product, ProductInput } from '../types';

export interface ProductListParams {
  search?: string;
  lowStockOnly?: boolean;
  limit?: number;
  skip?: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  skip: number;
}

export const productsApi = {
  list: (params: ProductListParams = {}): Promise<ProductListResponse> => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.lowStockOnly) query.set('lowStockOnly', 'true');
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.skip) query.set('skip', params.skip.toString());
    const qs = query.toString();
    return api.get<ProductListResponse>(`/products${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string): Promise<Product> => {
    return api.get<Product>(`/products/${id}`);
  },

  create: (data: ProductInput): Promise<Product> => {
    return api.post<Product>('/products', data);
  },

  update: (id: string, data: ProductInput): Promise<Product> => {
    return api.put<Product>(`/products/${id}`, data);
  },

  delete: (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete<{ success: boolean; message: string }>(`/products/${id}`);
  },
};
