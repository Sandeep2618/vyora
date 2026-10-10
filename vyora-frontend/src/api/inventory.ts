import { api } from '../lib/api';
import { StockMovement } from '../types';

export interface MovementListParams {
  productId?: string;
  limit?: number;
  skip?: number;
}

export interface MovementListResponse {
  items: (StockMovement & {
    productName: string;
    sku: string;
    unit: string;
  })[];
  total: number;
  limit: number;
  skip: number;
}

export interface StockAdjustmentInput {
  productId: string;
  quantityDelta: number;
  reason: string;
}

export const inventoryApi = {
  getMovements: (params: MovementListParams = {}): Promise<MovementListResponse> => {
    const query = new URLSearchParams();
    if (params.productId) query.set('productId', params.productId);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.skip) query.set('skip', params.skip.toString());
    const qs = query.toString();
    return api.get<MovementListResponse>(`/inventory/movements${qs ? `?${qs}` : ''}`);
  },

  createAdjustment: (dto: StockAdjustmentInput): Promise<StockMovement> => {
    return api.post<StockMovement>('/inventory/adjustments', dto);
  },
};
