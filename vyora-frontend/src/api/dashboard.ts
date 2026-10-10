import { api } from '../lib/api';
import { DashboardSummary } from '../types';

export const dashboardApi = {
  getMetrics: (): Promise<DashboardSummary> => {
    return api.get<DashboardSummary>('/dashboard/metrics');
  },
};
