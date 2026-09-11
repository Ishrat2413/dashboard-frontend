import { ServiceResponse, ServiceErrorResponse, LoginResponseData } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const HEALTH_BASE_URL =
  process.env.NEXT_PUBLIC_HEALTH_URL || 'http://localhost:8080';

export class ApiError extends Error {
  statusCode: number;
  errors?: { field: string; message: string }[];
  rawResponse?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errors?: { field: string; message: string }[],
    raw?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.rawResponse = raw;
  }
}

// Memory & Session Cache Keys
export const TOKEN_STORAGE_KEY = 'zentura_access_token';
export const USER_STORAGE_KEY = 'zentura_user';

let inMemoryAccessToken: string | null = null;

export function getStoredAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (stored) inMemoryAccessToken = stored;
  return stored;
}

export function setStoredAccessToken(accessToken: string) {
  inMemoryAccessToken = accessToken;
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
}

export function clearStoredAuth() {
  inMemoryAccessToken = null;
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
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
 * Universal fetch wrapper for the NestJS backend & Next.js BFF routes
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<ServiceResponse<T>> {
  const isHealth = endpoint === '/health' || endpoint === '/metrics';
  const isNextAuthRoute = endpoint.startsWith('/api/auth/');

  let url: string;
  if (isNextAuthRoute) {
    url = endpoint;
  } else if (isHealth) {
    url = `${HEALTH_BASE_URL}${endpoint}`;
  } else {
    url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  const headers = new Headers(options.headers || {});

  // Security Headers
  headers.set('X-Requested-With', 'XMLHttpRequest');

  const token = getStoredAccessToken();
  if (token && !headers.has('Authorization') && !isNextAuthRoute) {
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

  // Handle 401 and silent token refresh via HttpOnly cookie
  if (
    response.status === 401 &&
    retry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/api/auth/login') &&
    !endpoint.includes('/api/auth/refresh')
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (refreshRes.ok) {
          const data: ServiceResponse<LoginResponseData> = await refreshRes.json();
          if (data.data?.access_token) {
            setStoredAccessToken(data.data.access_token);
            isRefreshing = false;
            onRefreshed(data.data.access_token);
            // Retry original request with fresh token
            return apiRequest<T>(endpoint, options, false);
          }
        }
      } catch {
        // Refresh failed
      }

      isRefreshing = false;
      clearStoredAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        // eslint-disable-next-line @next/next/no-assign-module-variable, @next/next/no-html-link-for-pages
        window.location.assign('/login?expired=1');
      }
    } else {
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(apiRequest<T>(endpoint, options, false));
        });
      });
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
