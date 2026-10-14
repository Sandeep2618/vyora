import { useState, useEffect, useRef, useCallback } from 'react';
import { ITableServiceRequest } from '../../config/interface';
import { parseResponse } from '../../util/payload';
import { apiRequest } from '@/lib/api';

interface IUseFetchOptions<T> {
  api?: {
    url: string;
    method?: 'GET' | 'POST';
    service?: (req: ITableServiceRequest) => Promise<any>;
    responseAdapter?: (raw: any) => { list: T[]; count: number };
  };
  payload: Record<string, any>;
  enabled?: boolean;
  onSuccess?: (rows: T[], total: number) => void;
  onError?: (err: Error) => void;
}

export function useTableFetch<T = any>(options: IUseFetchOptions<T>) {
  const { api, payload, enabled = true, onSuccess, onError } = options;

  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(enabled && api?.url));
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchIdRef = useRef<number>(0);
  const hasLoadedOnceRef = useRef<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  const reload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  // Serialize payload to compare stability across renders
  const serializedPayload = JSON.stringify(payload);

  useEffect(() => {
    if (!enabled || !api?.url) {
      setIsLoading(false);
      setIsRefetching(false);
      return;
    }

    const currentFetchId = ++fetchIdRef.current;

    if (!hasLoadedOnceRef.current) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setError(null);

    const executeFetch = async () => {
      try {
        const method = api.method || 'GET';
        let rawResponse: any;

        if (api.service) {
          rawResponse = await api.service({
            method,
            url: api.url,
            data: method === 'POST' ? payload : undefined,
            params: method === 'GET' ? payload : undefined,
          });
        } else {
          // Default service using Vyora's apiRequest
          if (method === 'POST') {
            rawResponse = await apiRequest(api.url, {
              method: 'POST',
              body: JSON.stringify(payload),
            });
          } else {
            const queryParams = new URLSearchParams();
            for (const [k, v] of Object.entries(payload)) {
              if (v !== undefined && v !== null && v !== '') {
                if (typeof v === 'object') {
                  queryParams.set(k, JSON.stringify(v));
                } else {
                  queryParams.set(k, String(v));
                }
              }
            }
            const qs = queryParams.toString();
            const sep = api.url.includes('?') ? '&' : '?';
            const fullUrl = qs ? `${api.url}${sep}${qs}` : api.url;
            rawResponse = await apiRequest(fullUrl, { method: 'GET' });
          }
        }

        // Drop out-of-order race responses
        if (currentFetchId !== fetchIdRef.current) {
          return;
        }

        const parsed = api.responseAdapter
          ? api.responseAdapter(rawResponse)
          : parseResponse<T>(rawResponse);

        setRows(parsed.list);
        setTotal(parsed.count);
        hasLoadedOnceRef.current = true;
        onSuccess?.(parsed.list, parsed.count);
      } catch (err: any) {
        if (currentFetchId !== fetchIdRef.current) {
          return;
        }
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        onError?.(errorObj);
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setIsLoading(false);
          setIsRefetching(false);
        }
      }
    };

    executeFetch();
  }, [api?.url, api?.method, api?.service, api?.responseAdapter, serializedPayload, enabled, reloadTrigger]);

  return {
    rows,
    total,
    isLoading,
    isRefetching,
    error,
    reload,
  };
}
