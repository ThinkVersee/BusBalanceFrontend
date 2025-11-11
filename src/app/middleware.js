// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Public routes – skip every check
 */
const PUBLIC_ROUTES = ['/', '/login', '/register', '/admin/login'];

/**
 * Routes that require a specific role
 */
const ADMIN_PREFIX = '/admin';
const OWNER_PREFIX = '/owner';
const EMPLOYEE_PREFIX = '/employee';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // -----------------------------------------------------------------
  // 1. Public routes – always continue
  // -----------------------------------------------------------------
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // -----------------------------------------------------------------
  // 2. Grab tokens from cookies
  // -----------------------------------------------------------------
  const accessToken = request.cookies.get('access_token')?.value;
  const superadminToken = request.cookies.get('superadmin_access_token')?.value;

  // No token at all → let the client-side RouteGuard handle the redirect
  if (!accessToken && !superadminToken) {
    return NextResponse.next();
  }

  // -----------------------------------------------------------------
  // 3. Verify token & extract payload
  // -----------------------------------------------------------------
  let payload = null;
  let isSuperAdmin = false;

  try {
    if (superadminToken) {
      const { payload: p } = await jwtVerify(superadminToken, JWT_SECRET);
      payload = p;
      isSuperAdmin = true;
    } else if (accessToken) {
      const { payload: p } = await jwtVerify(accessToken, JWT_SECRET);
      payload = p;
    }
  } catch (err) {
    // Invalid / expired token → wipe all auth cookies
    const res = NextResponse.next();
    res.cookies.delete('access_token');
    res.cookies.delete('superadmin_access_token');
    res.cookies.delete('refresh_token');
    res.cookies.delete('superadmin_refresh_token');
    return res;
  }

  // -----------------------------------------------------------------
  // 4. Determine role
  // -----------------------------------------------------------------
  const role = isSuperAdmin
    ? 'superadmin'
    : payload?.is_owner
    ? 'owner'
    : payload?.is_employee
    ? 'employee'
    : 'unknown';

  // -----------------------------------------------------------------
  // 5. Role-based blocking
  // -----------------------------------------------------------------
  if (pathname.startsWith(ADMIN_PREFIX) && role !== 'superadmin') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (pathname.startsWith(OWNER_PREFIX) && role !== 'owner') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith(EMPLOYEE_PREFIX) && role !== 'employee') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // -----------------------------------------------------------------
  // 6. All good – continue
  // -----------------------------------------------------------------
  return NextResponse.next();
}

/* -----------------------------------------------------------------
   Run middleware on every page except static assets / API routes
   ----------------------------------------------------------------- */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};