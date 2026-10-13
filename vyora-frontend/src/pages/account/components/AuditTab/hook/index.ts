import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AuditLogsResponse } from '../config/interface';
import { AUDIT_QUERY_KEY, AUDIT_API_ENDPOINT } from '../config/constant';

export const useAuditLogs = () => {
  return useQuery<AuditLogsResponse>({
    queryKey: AUDIT_QUERY_KEY,
    queryFn: () => api.get(AUDIT_API_ENDPOINT),
  });
};
