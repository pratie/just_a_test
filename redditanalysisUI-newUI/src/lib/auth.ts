'use client';

import { create } from 'zustand';

export interface User {
  email: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;
  googleLogin: (token: string) => Promise<User>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Initialize user from localStorage if available
const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  
  return token && email ? { token, email } : null;
};

// Set cookie with HttpOnly flag
const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; SameSite=Lax`;
};

// Remove cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('token', user.token);
      localStorage.setItem('userEmail', user.email);
      setCookie('token', user.token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      removeCookie('token');
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    removeCookie('token');
    set({ user: null });
  },
  initialize: () => {
    const user = getInitialUser();
    if (user) {
      setCookie('token', user.token);
    }
    set({ user, isInitialized: true });
  },
  googleLogin: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to login with Google');
      }

      const data = await response.json();
      if (!data.email || !data.access_token) {
        throw new Error('Invalid response from server');
      }

      const user = { email: data.email, token: data.access_token };
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userEmail', data.email);
      setCookie('token', data.access_token);
      set({ user });
      
      // Force a page reload to ensure middleware picks up the new cookie
      window.location.href = '/projects';
      
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }
}));

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getUserEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userEmail');
};
