'use client';
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import { finishInitialization } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/admin/login'];
const ADMIN_ROUTES = '/admin';
const OWNER_ROUTES = '/owner';
const EMPLOYEE_ROUTES = '/employee';

export default function RouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const hasRedirected = useRef(false);

  const {
    isAuthenticated,
    isSuperAdmin,
    user,
    isLoading: authLoading,
    isInitializing,
  } = useAuth();

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // Finish initialization
    if (isInitializing) {
      dispatch(finishInitialization());
      return;
    }

    // Still loading auth state
    if (authLoading) return;

    // === 1. Block authenticated users from public/auth pages ===
    if (isAuthenticated && PUBLIC_ROUTES.includes(pathname)) {
      hasRedirected.current = true;
      if (isSuperAdmin) {
        router.replace('/admin');
      } else if (user?.is_owner) {
        router.replace('/owner');
      } else if (user?.is_employee) {
        router.replace('/employee');
      } else {
        router.replace('/');
      }
      return;
    }

    // === 2. Non-authenticated users on protected routes ===
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      hasRedirected.current = true;
      const target = pathname.startsWith('/admin') ? '/admin/login' : '/login';
      router.replace(target);
      return;
    }

    // === 3. Role-based route protection ===
    // Admin routes
    if (pathname.startsWith(ADMIN_ROUTES) && pathname !== '/admin/login') {
      if (!isSuperAdmin) {
        hasRedirected.current = true;
        router.replace('/admin/login');
        return;
      }
    }

    // Owner routes
    if (pathname.startsWith(OWNER_ROUTES) && !user?.is_owner) {
      hasRedirected.current = true;
      router.replace('/login');
      return;
    }

    // Employee routes
    if (pathname.startsWith(EMPLOYEE_ROUTES) && !user?.is_employee) {
      hasRedirected.current = true;
      router.replace('/login');
      return;
    }

    // === 4. SuperAdmin should not stay on /admin/login ===
    if (isSuperAdmin && pathname === '/admin/login') {
      hasRedirected.current = true;
      router.replace('/admin');
      return;
    }

    // Reset redirect flag when path changes
    hasRedirected.current = false;
  }, [
    isAuthenticated,
    isSuperAdmin,
    user,
    pathname,
    router,
    authLoading,
    isInitializing,
    dispatch,
  ]);

  // Show loading screen during init or auth check
  if (isInitializing || authLoading) {
    return (
      <AuthLoadingScreen
        message={isInitializing ? 'Initializing session…' : 'Verifying authentication…'}
      />
    );
  }

  return <>{children}</>;
}