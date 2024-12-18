'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, initialize, isInitialized } = useAuthStore();

  // Initialize auth state
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Handle navigation
  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    
    if (!user?.token && !isPublicRoute) {
      console.log('No token, redirecting to login...');
      router.push('/login');
    } else if (user?.token && isPublicRoute) {
      console.log('Has token, redirecting to projects...');
      router.push('/projects');
    }
  }, [user, router, pathname, isInitialized]);

  // Don't render until initialized
  if (!isInitialized) {
    return null;
  }

  const value = {
    user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
