import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Middleware to protect routes based on user role
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const superadminAccessToken = request.cookies.get('superadmin_access_token')?.value;
  
  // Define public routes - only these are accessible without authentication
  const publicRoutes = ['/', '/login', '/register', '/admin/login'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check if user has any valid token
  const hasToken = accessToken || superadminAccessToken;
  
  // If no token exists, redirect to login
  if (!hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Determine user role from token
  let userRole = null;
  let isOwner = false;
  let isEmployee = false;
  
  try {
    if (superadminAccessToken) {
      // Verify superadmin token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(superadminAccessToken, secret);
      
      if (payload.is_superuser) {
        userRole = 'superadmin';
      }
    } else if (accessToken) {
      // Verify regular user token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(accessToken, secret);
      
      // Assuming your JWT payload contains role information
      isOwner = payload.is_owner || false;
      isEmployee = payload.is_employee || false;
      
      userRole = isOwner ? 'owner' : isEmployee ? 'employee' : 'user';
    }
  } catch (error) {
    // Token verification failed - redirect to login
    console.error('Token verification failed:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Clear invalid tokens
    response.cookies.delete('access_token');
    response.cookies.delete('superadmin_access_token');
    
    return response;
  }
  
  // Route protection based on user role
  
  // Superadmin routes - only accessible by superadmin
  if (pathname.startsWith('/superadmin') || pathname.startsWith('/admin')) {
    if (userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // Owner routes - only accessible by owners
  if (pathname.startsWith('/owner')) {
    if (userRole !== 'owner') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // Employee routes - only accessible by employees
  if (pathname.startsWith('/employee')) {
    if (userRole !== 'employee') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // All other routes require authentication (which we already checked)
  return NextResponse.next();
}

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};