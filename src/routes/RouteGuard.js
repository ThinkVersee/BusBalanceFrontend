// routes/RouteGuard.jsx
'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isSuperAdmin, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['/', '/login', '/register', '/admin/login'];
    const isPublic = publicRoutes.includes(pathname);

    // 1. Not logged in → login
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
      return;
    }

    // 2. Logged in on a login page → go to dashboard
    if (isAuthenticated && (pathname === '/login' || pathname === '/admin/login')) {
      if (isSuperAdmin) {
        router.replace('/admin/dashboard');
      } else if (user?.is_owner) {
        router.replace('/owner/dashboard');
      } else if (user?.is_employee) {
        router.replace('/employee/dashboard');
      }
      return;
    }

    // 3. Role mismatch (fallback, middleware already blocked most)
    if (pathname.startsWith('/admin') && !isSuperAdmin) {
      router.replace('/admin/login');
    } else if (pathname.startsWith('/owner') && !user?.is_owner) {
      router.replace('/login');
    } else if (pathname.startsWith('/employee') && !user?.is_employee) {
      router.replace('/login');
    }
  }, [isAuthenticated, isSuperAdmin, user, pathname, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}