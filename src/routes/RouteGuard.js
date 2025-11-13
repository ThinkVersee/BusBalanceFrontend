// routes/RouteGuard.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/admin/login'];

export default function RouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isSuperAdmin, user, isLoading: authLoading } = useAuth();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const run = () => {
      // -------------------------------------------------------------
      // Still loading auth context → wait
      // -------------------------------------------------------------
      if (authLoading) {
        setChecking(true);
        return;
      }

      // -------------------------------------------------------------
      // Public route → always allow
      // -------------------------------------------------------------
      if (PUBLIC_ROUTES.includes(pathname)) {
        setAuthorized(true);
        setChecking(false);
        return;
      }

      // -------------------------------------------------------------
      // Not authenticated → go to appropriate login
      // -------------------------------------------------------------
      if (!isAuthenticated) {
        setAuthorized(false);
        setChecking(false);
        const target = pathname.startsWith('/admin') ? '/admin/login' : '/login';
        router.replace(target);
        return;
      }

      // -------------------------------------------------------------
      // Authenticated – role checks
      // -------------------------------------------------------------
      if (pathname.startsWith('/admin') && !isSuperAdmin) {
        setAuthorized(false);
        setChecking(false);
        router.replace('/admin/login');
        return;
      }

      if (pathname.startsWith('/owner') && !user?.is_owner) {
        setAuthorized(false);
        setChecking(false);
        router.replace('/login');
        return;
      }

      if (pathname.startsWith('/employee') && !user?.is_employee) {
        setAuthorized(false);
        setChecking(false);
        router.replace('/login');
        return;
      }

      // -------------------------------------------------------------
      // Prevent logged-in users from seeing login pages
      // -------------------------------------------------------------
      if (isAuthenticated && (pathname === '/login' || pathname === '/admin/login')) {
        setAuthorized(false);
        setChecking(false);
        if (isSuperAdmin) router.replace('/admin/dashboard');
        else if (user?.is_owner) router.replace('/owner/dashboard');
        else if (user?.is_employee) router.replace('/employee/dashboard');
        return;
      }

      // -------------------------------------------------------------
      // All checks passed
      // -------------------------------------------------------------
      setAuthorized(true);
      setChecking(false);
    };

    run();
  }, [isAuthenticated, isSuperAdmin, user, pathname, router, authLoading]);

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  if (checking || authLoading) {
    return <AuthLoadingScreen message="Verifying authentication..." />;
  }

  if (!authorized) {
    return <AuthLoadingScreen message="Redirecting..." />;
  }

  return <>{children}</>;
}