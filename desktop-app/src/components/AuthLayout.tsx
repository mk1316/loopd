'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated and not already on login page
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, render children without sidebar (login page)
  if (!user) {
    return <>{children}</>;
  }

  // If authenticated, render the full app layout with sidebar
  return (
    <div className="flex min-h-screen h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto">{children}</main>
    </div>
  );
} 