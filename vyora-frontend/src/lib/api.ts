function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  // If invalid placeholder containing '<' or '>', fallback to live Render URL
  if (envUrl && (envUrl.includes('<') || envUrl.includes('>'))) {
    return 'https://vyora-backend-gmx6.onrender.com/api/v1';
  }
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  // Production fallback to live Render backend
  if (import.meta.env.PROD) {
    return 'https://vyora-backend-gmx6.onrender.com/api/v1';
  }
  return '/api/v1';
}

const API_BASE = getApiBase();

export class ApiError extends Error {
  statusCode: number;
  data: any;
  requestId?: string;

  constructor(message: string, statusCode: number, data?: any, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.requestId = requestId || data?.requestId;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('vyora_token');
  const businessId = localStorage.getItem('vyora_business_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (businessId && businessId !== 'undefined' && businessId !== 'null') {
    headers['x-business-id'] = businessId;
  } else if (businessId) {
    localStorage.removeItem('vyora_business_id');
  }

  const method = (options.method || 'GET').toUpperCase();
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const durationMs = Math.round(performance.now() - startTime);
    const traceId = response.headers.get('x-request-id') || undefined;

    if (response.status === 401) {
      // If token expired, clear and trigger redirect to login
      localStorage.removeItem('vyora_token');
      localStorage.removeItem('vyora_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }

    const data = await response.json().catch(() => null);
    const requestId = traceId || data?.requestId;

    if (response.status === 403) {
      window.dispatchEvent(
        new CustomEvent('vyora:forbidden', {
          detail: {
            statusCode: 403,
            error: data?.error,
            requiredRoles: data?.requiredRoles,
            currentRole: data?.currentRole,
            requiredPlan: data?.requiredPlan,
            currentPlan: data?.currentPlan,
            isOwner: data?.isOwner,
            message: Array.isArray(data?.message) ? data.message.join(', ') : data?.message,
          },
        }),
      );
    }

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error ${response.status}`;

      if (import.meta.env.DEV) {
        console.error(
          `%c[API ${response.status}] %c${method} ${endpoint} %c(${durationMs}ms) [Trace: ${requestId || 'N/A'}]`,
          'color: #DC2626; font-weight: bold;',
          'color: #1F2937; font-weight: 600;',
          'color: #6B7280;',
          { error: errorMsg, details: data?.details, data },
        );
      }

      throw new ApiError(
        Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        response.status,
        data,
        requestId,
      );
    }

    if (import.meta.env.DEV) {
      console.debug(
        `%c[API ${response.status}] %c${method} ${endpoint} %c(${durationMs}ms) [Trace: ${requestId || 'N/A'}]`,
        'color: #0F766E; font-weight: bold;',
        'color: #1F2937; font-weight: 600;',
        'color: #6B7280;',
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or connection failure
    const durationMs = Math.round(performance.now() - startTime);
    if (import.meta.env.DEV) {
      console.error(
        `%c[API NETWORK ERROR] %c${method} ${endpoint} %c(${durationMs}ms)`,
        'color: #DC2626; font-weight: bold;',
        'color: #1F2937;',
        'color: #6B7280;',
        error,
      );
    }
    throw new ApiError('Unable to connect to server. Please check your network or server status.', 0, error);
  }
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),
  put: <T>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
};
