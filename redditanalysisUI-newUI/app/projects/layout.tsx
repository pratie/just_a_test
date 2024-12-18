'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  );
}
