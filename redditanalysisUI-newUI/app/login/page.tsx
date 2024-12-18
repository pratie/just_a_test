'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import Script from 'next/script';
import { toast } from 'sonner';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, googleLogin, isInitialized } = useAuthStore();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isGoogleInitialized = useRef(false);

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      await googleLogin(response.credential);
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in');
    }
  }, [googleLogin]);

  const initializeGoogleSignIn = useCallback(() => {
    if (!window.google || isGoogleInitialized.current || !googleButtonRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, { 
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 280
      });

      isGoogleInitialized.current = true;
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
      toast.error('Failed to initialize Google Sign-In');
    }
  }, [handleCredentialResponse]);

  useEffect(() => {
    if (user) {
      router.push('/projects');
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.google && !isGoogleInitialized.current) {
        initializeGoogleSignIn();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeGoogleSignIn]);

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-medium tracking-tight text-gray-900">
            Welcome to SneakyGuy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your Reddit tracking projects
          </p>
        </div>
        <div className="mt-8">
          <div ref={googleButtonRef} className="flex justify-center" />
        </div>
      </div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={initializeGoogleSignIn}
      />
    </div>
  );
}
