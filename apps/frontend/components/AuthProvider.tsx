"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, systemApi, User, isTokenExpired } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string }>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  setSession: (token: string, user: User, rememberMe?: boolean) => void;
  verifySession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const lastVerifiedRef = useRef<number>(0);

  // Core session verification against backend and token exp claim
  const verifySession = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      if (token || user) {
        setToken(null);
        setUser(null);
      }
      return false;
    }

    // Instant local verification of JWT expiration
    if (isTokenExpired(storedToken)) {
      console.warn("Session expired based on token expiration claim. Purging authentication state.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      if (pathname && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
      return false;
    }

    // Active server verification via /auth/me heartbeat
    try {
      lastVerifiedRef.current = Date.now();
      const freshUser = await authApi.getProfile();
      setUser(freshUser);
      setToken(storedToken);
      localStorage.setItem('user', JSON.stringify(freshUser));
      return true;
    } catch (apiErr: any) {
      if (apiErr.response?.status === 401 || apiErr.response?.status === 403) {
        console.warn("Session rejected by server, cleaning up authentication state.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        if (pathname && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
      return false;
    }
  }, [token, user, pathname, router]);

  // Initial rehydration on mount
  const rehydrateSession = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        if (isTokenExpired(storedToken)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        } else {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // fallback to remote verify
            }
          }
          await verifySession();
        }
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to rehydrate session:", e);
    } finally {
      setIsLoading(false);
    }
  }, [verifySession]);

  useEffect(() => {
    // Early non-blocking wake-up probe for Render container cold starts
    systemApi.wakeUpBackend();
    rehydrateSession();

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        rehydrateSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [rehydrateSession]);

  // Actively verify session on route change
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      verifySession();
    }
  }, [pathname, verifySession]);

  // Actively verify session on user activity (clicks, keys, tab focus, visibility change)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkActivity = () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return;

      // Instant check for token expiry on every user activity
      if (isTokenExpired(storedToken)) {
        verifySession();
        return;
      }

      // Throttled server verification on user activity (at most once every 30 seconds)
      const now = Date.now();
      if (now - lastVerifiedRef.current > 30000) {
        verifySession();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkActivity();
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, checkActivity, { passive: true }));
    window.addEventListener('focus', checkActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, checkActivity));
      window.removeEventListener('focus', checkActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [verifySession]);

  const setSession = (newToken: string, newUser: User, rememberMe = true) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('saved_email', newUser.email);
      } else {
        localStorage.removeItem('remember_me');
        localStorage.removeItem('saved_email');
      }
    }
  };

  const login = async (email: string, pass: string, rememberMe = true) => {
    const data = await authApi.login(email, pass);
    if (data.requiresVerification) {
      return { success: false, requiresVerification: true, email: data.email || email };
    }

    setSession(data.accessToken, data.user, rememberMe);
    return { success: true };
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const freshUser = await authApi.getProfile();
      setUser(freshUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
      return freshUser;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser,
        setSession,
        verifySession,
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
