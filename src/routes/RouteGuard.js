'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import { finishInitialization, forceLogout } from '@/store/slices/authSlice';
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
  const [hasCheckedInitialAuth, setHasCheckedInitialAuth] = useState(false);

  const {
    isAuthenticated,
    isSuperAdmin,
    user,
    isLoading: authLoading,
    isInitializing,
    accessToken,
  } = useAuth();

  // Step 1: Check token validity on initial load and back button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkTokenValidity = () => {
      // Check if we have tokens in cookies/localStorage
      const hasAccessToken = 
        document.cookie.includes('access_token') || 
        document.cookie.includes('superadmin_access_token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('superadmin_access_token');
      
      const hasRefreshToken = 
        document.cookie.includes('refresh_token') || 
        document.cookie.includes('superadmin_refresh_token') ||
        localStorage.getItem('refresh_token') ||
        localStorage.getItem('superadmin_refresh_token');

      // If Redux says authenticated but no tokens exist, force logout
      if (isAuthenticated && (!hasAccessToken || !hasRefreshToken)) {
        console.warn('Token mismatch detected - forcing logout');
        dispatch(forceLogout());
        return false;
      }
      
      return hasAccessToken;
    };

    // Run check on initial mount
    if (!hasCheckedInitialAuth) {
      const isValid = checkTokenValidity();
      if (!isValid && isAuthenticated) {
        // Auth state is out of sync, force logout
        dispatch(forceLogout());
      }
      setHasCheckedInitialAuth(true);
      dispatch(finishInitialization());
    }
  }, [dispatch, isAuthenticated, hasCheckedInitialAuth]);

  // Step 2: Handle route protection and redirects
  useEffect(() => {
    // Prevent overlapping checks
    if (isProcessing.current) return;
    
    // Skip if still initializing or loading
    if (isInitializing || authLoading || !hasCheckedInitialAuth) {
      return;
    }

    isProcessing.current = true;
    setIsNavigating(true);

    // Function to determine and execute redirect
    const performRedirectCheck = () => {
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
        console.log(`Redirecting from ${pathname} to ${redirectPath}`);
        router.replace(redirectPath);
        // Keep navigating state true during redirect
        setTimeout(() => {
          setIsNavigating(false);
          isProcessing.current = false;
        }, 300);
        return true; // Redirect occurred
      }
      
      setIsNavigating(false);
      isProcessing.current = false;
      return false; // No redirect
    };

    // Execute the check
    const didRedirect = performRedirectCheck();
    
    // If no redirect occurred, ensure we're not stuck in navigating state
    if (!didRedirect) {
      setTimeout(() => {
        setIsNavigating(false);
        isProcessing.current = false;
      }, 100);
    }
  }, [
    isAuthenticated,
    isSuperAdmin,
    user?.is_owner,
    user?.is_employee,
    pathname,
    router,
    authLoading,
    isInitializing,
    hasCheckedInitialAuth,
    dispatch,
  ]);

  // Step 3: Handle back button specifically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      console.log('Back/Forward button pressed');
      
      // Immediately check tokens
      const hasAccessToken = 
        document.cookie.includes('access_token') || 
        document.cookie.includes('superadmin_access_token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('superadmin_access_token');
      
      // If no tokens but in protected route, force redirect
      if (!hasAccessToken && !PUBLIC_ROUTES.includes(pathname)) {
        setIsNavigating(true);
        const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';
        router.replace(loginPath);
        setTimeout(() => setIsNavigating(false), 300);
      } else {
        // Trigger re-evaluation of current route
        setIsNavigating(true);
        setTimeout(() => setIsNavigating(false), 150);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  // Step 4: Double-check token consistency on every route change
  useEffect(() => {
    if (typeof window === 'undefined' || !hasCheckedInitialAuth) return;

    const verifyTokenConsistency = () => {
      const cookieAccessToken = 
        document.cookie.includes('superadmin_access_token') 
          ? (Cookies.get('superadmin_access_token') || localStorage.getItem('superadmin_access_token'))
          : (Cookies.get('access_token') || localStorage.getItem('access_token'));
      
      // If Redux has token but cookies don't, force logout
      if (accessToken && !cookieAccessToken) {
        console.warn('Token inconsistency detected on route change');
        dispatch(forceLogout());
      }
      // If cookies have token but Redux doesn't, refresh the page to sync
      else if (!accessToken && cookieAccessToken) {
        console.warn('Redux state out of sync, refreshing...');
        window.location.reload();
      }
    };

    // Small delay to allow state updates
    const timer = setTimeout(verifyTokenConsistency, 100);
    return () => clearTimeout(timer);
  }, [pathname, accessToken, dispatch, hasCheckedInitialAuth]);

  // Show loading during initial auth check OR navigation
  if (isInitializing || authLoading || isNavigating || !hasCheckedInitialAuth) {
    return (
      <AuthLoadingScreen
        message={
          !hasCheckedInitialAuth 
            ? 'Checking authentication...' 
            : isNavigating 
            ? 'Verifying access...'
            : authLoading
            ? 'Processing...'
            : 'Loading...'
        }
      />
    );
  }

  // Render children
  return <>{children}</>;
}