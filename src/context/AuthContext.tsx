'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { User, LoginResponseData, ServiceResponse } from '@/lib/types';
import {
  apiRequest,
  getStoredAccessToken,
  setStoredAccessToken,
  clearStoredAuth,
  USER_STORAGE_KEY,
} from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  failedAttempts: number;
  lockoutRemainingSeconds: number;
  login: (email: string, password: string) => Promise<LoginResponseData>;
  register: (fullName: string, email: string, password: string, role?: string) => Promise<unknown>;
  verifyAccount: (email: string, otp: string) => Promise<unknown>;
  resendVerificationOtp: (email: string) => Promise<unknown>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<unknown>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 15 minutes session inactivity timeout in ms
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const FAILED_ATTEMPTS_KEY = 'zentura_failed_logins';
const LOCKOUT_TIMESTAMP_KEY = 'zentura_lockout_until';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Anti-Brute-Force Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Inactivity tracking
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const res: ServiceResponse<User> = await apiRequest('/profile/me');
      if (res.data) {
        setUser(res.data);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
        }
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    }
    return null;
  }, []);

  // Check lockout on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedFailed = parseInt(sessionStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10);
    setFailedAttempts(storedFailed);

    const lockoutUntil = parseInt(sessionStorage.getItem(LOCKOUT_TIMESTAMP_KEY) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      setLockoutRemainingSeconds(Math.ceil((lockoutUntil - now) / 1000));
    }
  }, []);

  // Decrement lockout countdown timer
  useEffect(() => {
    if (lockoutRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemainingSeconds((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemainingSeconds]);

  // Session Inactivity Auto-Lockout Engine
  useEffect(() => {
    if (!accessToken || !user) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, updateActivity, { passive: true }));

    inactivityTimerRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        // Auto-lock session due to inactivity
        clearStoredAuth();
        setUser(null);
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @next/next/no-assign-module-variable, @next/next/no-html-link-for-pages
          window.location.assign('/login?expired=1&reason=inactivity');
        }
      }
    }, 10000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, updateActivity));
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
    };
  }, [accessToken, user]);

  // Hydrate auth on initial mount: try silent refresh via HttpOnly cookie
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      const token = getStoredAccessToken();
      const savedUserStr = sessionStorage.getItem(USER_STORAGE_KEY);

      if (token) {
        setAccessToken(token);
        if (savedUserStr) {
          try {
            setUser(JSON.parse(savedUserStr));
          } catch {
            // parse error
          }
        }
        await refreshProfile();
      } else {
        // Try silent refresh using HttpOnly cookie
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          });
          if (refreshRes.ok) {
            const data: ServiceResponse<LoginResponseData> = await refreshRes.json();
            if (data.data?.access_token) {
              setStoredAccessToken(data.data.access_token);
              setAccessToken(data.data.access_token);
              await refreshProfile();
            }
          }
        } catch {
          // Silent refresh not applicable
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [refreshProfile]);

  const login = async (email: string, password: string): Promise<LoginResponseData> => {
    // Check if client is locked out
    if (lockoutRemainingSeconds > 0) {
      throw new Error(`Account temporarily locked for security. Try again in ${lockoutRemainingSeconds}s.`);
    }

    try {
      // Call Next.js BFF route which sets the HttpOnly cookie
      const res: ServiceResponse<LoginResponseData> = await apiRequest(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );

      const data = res.data;
      setStoredAccessToken(data.access_token);
      setAccessToken(data.access_token);

      // Reset failed attempts on success
      setFailedAttempts(0);
      sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
      sessionStorage.removeItem(LOCKOUT_TIMESTAMP_KEY);

      // Fetch full profile
      const profile = await refreshProfile();
      if (!profile && data.user) {
        const fallbackUser: User = {
          id: '',
          name: data.user.fullName,
          email: data.user.email || email,
          acc_verified: true,
          role: (data.user.role as any) || 'CUSTOMER',
          is_suspended: false,
        };
        setUser(fallbackUser);
      }

      return data;
    } catch (err: any) {
      // Increment failed attempts
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      sessionStorage.setItem(FAILED_ATTEMPTS_KEY, newAttempts.toString());

      if (newAttempts >= 5) {
        // Progressive exponential lockout: 30s for 5, 60s for 6, 120s for 7+
        const penaltySeconds = Math.min(30 * Math.pow(2, newAttempts - 5), 300);
        const lockUntil = Date.now() + penaltySeconds * 1000;
        sessionStorage.setItem(LOCKOUT_TIMESTAMP_KEY, lockUntil.toString());
        setLockoutRemainingSeconds(penaltySeconds);
      }

      throw err;
    }
  };

  const register = async (fullName: string, email: string, password: string, role?: string) => {
    // Exact NestJS DTO contract: fullName, email, password, role
    const payload: Record<string, string> = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    };
    if (role) payload.role = role;

    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const verifyAccount = async (email: string, otp: string) => {
    return await apiRequest('/auth/verify-account', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
    });
  };

  const resendVerificationOtp = async (email: string) => {
    return await apiRequest('/auth/resend-verification-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    // Exact NestJS DTO contract: oldPassword, newPassword
    return await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue clearing local state
    } finally {
      clearStoredAuth();
      setUser(null);
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @next/next/no-assign-module-variable, @next/next/no-html-link-for-pages
        window.location.assign('/login');
      }
    }
  };

  const logoutAll = async () => {
    try {
      await apiRequest('/auth/logout-all', { method: 'POST' });
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue
    } finally {
      clearStoredAuth();
      setUser(null);
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @next/next/no-assign-module-variable, @next/next/no-html-link-for-pages
        window.location.assign('/login');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!accessToken && !!user,
        failedAttempts,
        lockoutRemainingSeconds,
        login,
        register,
        verifyAccount,
        resendVerificationOtp,
        changePassword,
        logout,
        logoutAll,
        refreshProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
