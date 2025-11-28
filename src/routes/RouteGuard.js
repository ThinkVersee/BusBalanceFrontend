'use client';
import { useEffect, useRef, useState } from 'react';
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
  const isProcessing = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    isAuthenticated,
    isSuperAdmin,
    user,
    isLoading: authLoading,
    isInitializing,
  } = useAuth();

  useEffect(() => {
    // Prevent overlapping checks
    if (isProcessing.current) return;
    
    // Skip if still initializing or loading
    if (isInitializing || authLoading) {
      if (isInitializing) {
        dispatch(finishInitialization());
      }
      return;
    }

    isProcessing.current = true;

    // Determine if redirect is needed
    let redirectPath = null;

    // Check 1: Authenticated users on public routes
    if (isAuthenticated && PUBLIC_ROUTES.includes(pathname)) {
      if (isSuperAdmin) {
        redirectPath = '/admin';
      } else if (user?.is_owner) {
        redirectPath = '/owner';
      } else if (user?.is_employee) {
        redirectPath = '/employee';
      } else {
        redirectPath = '/';
      }
    }
    // Check 2: Non-authenticated users on protected routes
    else if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      redirectPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';
    }
    // Check 3: Admin routes without admin privileges
    else if (pathname.startsWith(ADMIN_ROUTES) && pathname !== '/admin/login' && !isSuperAdmin) {
      redirectPath = '/admin/login';
    }
    // Check 4: Owner routes without owner privileges
    else if (pathname.startsWith(OWNER_ROUTES) && !user?.is_owner) {
      redirectPath = '/login';
    }
    // Check 5: Employee routes without employee privileges
    else if (pathname.startsWith(EMPLOYEE_ROUTES) && !user?.is_employee) {
      redirectPath = '/login';
    }
    // Check 6: SuperAdmin on login page
    else if (isSuperAdmin && pathname === '/admin/login') {
      redirectPath = '/admin';
    }

    // Perform redirect if needed
    if (redirectPath && redirectPath !== pathname) {
      setIsNavigating(true);
      router.replace(redirectPath);
      // Clear navigating state after redirect starts
      setTimeout(() => setIsNavigating(false), 100);
    } else {
      setIsNavigating(false);
    }

    isProcessing.current = false;
  }, [
    isAuthenticated,
    isSuperAdmin,
    user?.is_owner,
    user?.is_employee,
    pathname,
    router,
    authLoading,
    isInitializing,
    dispatch,
  ]);

  // Handle back button - show loading during verification
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      // Show loading immediately
      setIsNavigating(true);
      
      // Check if unauthorized access
      if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
        // Redirect to appropriate login
        const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';
        router.replace(loginPath);
        setTimeout(() => setIsNavigating(false), 100);
      } else {
        // Hide loading after brief check
        setTimeout(() => setIsNavigating(false), 150);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, pathname, router]);

  // Show loading during initial auth check OR navigation
  if (isInitializing || authLoading || isNavigating) {
    return (
      <AuthLoadingScreen
        message={
          isInitializing 
            ? 'Initializing session…' 
            : isNavigating 
            ? 'Verifying access…'
            : 'Verifying authentication…'
        }
      />
    );
  }

  // Render children
  return <>{children}</>;
}