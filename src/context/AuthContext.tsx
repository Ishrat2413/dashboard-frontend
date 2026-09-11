'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginResponseData, ServiceResponse } from '@/lib/types';
import {
  apiRequest,
  getStoredAccessToken,
  setStoredTokens,
  clearStoredAuth,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponseData>;
  register: (name: string, email: string, password: string, role?: string) => Promise<any>;
  verifyAccount: (email: string, otp: string) => Promise<any>;
  resendVerificationOtp: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const res: ServiceResponse<User> = await apiRequest('/profile/me');
      if (res.data) {
        setUser(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
        }
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    }
    return null;
  }, []);

  // Hydrate auth on initial mount
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      const token = getStoredAccessToken();
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);

      if (token) {
        setAccessToken(token);
        if (savedUserStr) {
          try {
            setUser(JSON.parse(savedUserStr));
          } catch {
            // parse error
          }
        }
        // Fetch fresh profile from backend
        await refreshProfile();
      }

      setIsLoading(false);
    };

    initAuth();
  }, [refreshProfile]);

  const login = async (email: string, password: string): Promise<LoginResponseData> => {
    const res: ServiceResponse<LoginResponseData> = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = res.data;
    setStoredTokens(data.access_token, data.refresh_token);
    setAccessToken(data.access_token);

    // Fetch full profile
    const profile = await refreshProfile();
    if (!profile && data.user) {
      // Fallback
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
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const payload: any = { name, email, password };
    if (role) payload.role = role;

    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const verifyAccount = async (email: string, otp: string) => {
    return await apiRequest('/auth/verify-account', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  };

  const resendVerificationOtp = async (email: string) => {
    return await apiRequest('/auth/resend-verification-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      clearStoredAuth();
      setUser(null);
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const logoutAll = async () => {
    try {
      await apiRequest('/auth/logout-all', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      clearStoredAuth();
      setUser(null);
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
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
        login,
        register,
        verifyAccount,
        resendVerificationOtp,
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
