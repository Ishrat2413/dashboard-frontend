export type UserRole = 'ADMIN' | 'SHOP_OWNER' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  acc_verified: boolean;
  role: UserRole;
  is_suspended: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface AuthUserPayload {
  email: string | null;
  fullName: string;
  role: UserRole;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: AuthUserPayload;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  method?: string;
  endpoint?: string;
  statusCode: number;
  timestamp: string;
  data: T;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ServiceErrorResponse {
  success: false;
  message: string;
  method?: string;
  endpoint?: string;
  statusCode: number;
  timestamp?: string;
  errors?: ApiFieldError[];
  error?: string;
}

export interface HealthStatus {
  status: string;
  uptime: number;
  timestamp: string;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}

export interface ResetTokenPayload {
  reset_token: string;
  expires_in: number;
}
