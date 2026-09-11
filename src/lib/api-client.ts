import { ServiceResponse, ServiceErrorResponse, LoginResponseData } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const HEALTH_BASE_URL =
  process.env.NEXT_PUBLIC_HEALTH_URL || 'http://localhost:8080';

export class ApiError extends Error {
  statusCode: number;
  errors?: { field: string; message: string }[];
  rawResponse?: any;

  constructor(message: string, statusCode: number, errors?: { field: string; message: string }[], raw?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.rawResponse = raw;
  }
}

// Token storage helpers
export const TOKEN_STORAGE_KEY = 'zentura_access_token';
export const REFRESH_STORAGE_KEY = 'zentura_refresh_token';
export const USER_STORAGE_KEY = 'zentura_user';

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_STORAGE_KEY);
}

export function setStoredTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Universal fetch wrapper for the NestJS backend
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<ServiceResponse<T>> {
  const isHealth = endpoint === '/health' || endpoint === '/metrics';
  const url = isHealth
    ? `${HEALTH_BASE_URL}${endpoint}`
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  
  const token = getStoredAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If not FormData, set Content-Type to application/json
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 and token refresh
  if (response.status === 401 && retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data: ServiceResponse<LoginResponseData> = await refreshRes.json();
            if (data.data?.access_token && data.data?.refresh_token) {
              setStoredTokens(data.data.access_token, data.data.refresh_token);
              isRefreshing = false;
              onRefreshed(data.data.access_token);
              // Retry original request
              return apiRequest<T>(endpoint, options, false);
            }
          }
        } catch {
          // Refresh failed
        }

        isRefreshing = false;
        clearStoredAuth();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?expired=1';
        }
      } else {
        // Wait for active refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(apiRequest<T>(endpoint, options, false));
          });
        });
      }
    }
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errBody = data as ServiceErrorResponse;
    const message = errBody?.message || response.statusText || 'An error occurred';
    throw new ApiError(message, response.status, errBody?.errors, errBody);
  }

  return data as ServiceResponse<T>;
}
