"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, systemApi, User } from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string }>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  setSession: (token: string, user: User, rememberMe?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Re-hydrate session from localStorage and validate with server
  const rehydrateSession = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // In case of corrupt JSON, will refresh via API
          }
        }

        // Validate token integrity and refresh profile dynamically
        try {
          const freshUser = await authApi.getProfile();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (apiErr: any) {
          // If server rejects the token (e.g., expired or user suspended), purge cleanly
          if (apiErr.response?.status === 401 || apiErr.response?.status === 403) {
            console.warn("Session expired or invalid, cleaning up authentication state.");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
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
  }, []);

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
