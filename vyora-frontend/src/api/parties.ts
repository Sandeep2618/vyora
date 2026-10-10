import { api } from '../lib/api';
import { Party, PartyInput, PartyType } from '../types';

export interface PartyListParams {
  type?: PartyType;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface PartyListResponse {
  items: Party[];
  total: number;
  limit: number;
  skip: number;
}

export const partiesApi = {
  list: (params: PartyListParams = {}): Promise<PartyListResponse> => {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.skip) query.set('skip', params.skip.toString());
    const qs = query.toString();
    return api.get<PartyListResponse>(`/parties${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string): Promise<Party> => {
    return api.get<Party>(`/parties/${id}`);
  },

  create: (data: PartyInput): Promise<Party> => {
    return api.post<Party>('/parties', data);
  },

  update: (id: string, data: PartyInput): Promise<Party> => {
    return api.put<Party>(`/parties/${id}`, data);
  },
};
