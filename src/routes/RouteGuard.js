'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isSuperAdmin, user, isLoading } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    const publicRoutes = ['/', '/login', '/register', '/admin/login'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated and not on public route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
      return;
    }

    // If authenticated and on login page, redirect based on role
    if (isAuthenticated && (pathname === '/login' || pathname === '/admin/login')) {
      if (isSuperAdmin) {
        router.push('/admin');
      } else if (user?.is_owner) {
        router.push('/owner');
      } else if (user?.is_employee) {
        router.push('/employee');
      } else {
        router.push('/login');
      }
      return;
    }

    // Route-specific protection
    if (pathname.startsWith('/admin') || pathname.startsWith('/admin')) {
      if (!isSuperAdmin) {
        router.push('/admin/login');
      }
    } else if (pathname.startsWith('/owner')) {
      if (!user?.is_owner) {
        router.push('/login');
      }
    } else if (pathname.startsWith('/employee')) {
      if (!user?.is_employee) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isSuperAdmin, user, pathname, router, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return children;
}