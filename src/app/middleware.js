// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // ---- Public routes -------------------------------------------------
  const publicRoutes = ['/', '/login', '/register', '/admin/login'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ---- Tokens -------------------------------------------------------
  const accessToken = request.cookies.get('access_token')?.value;
  const superadminToken = request.cookies.get('superadmin_access_token')?.value;

  if (!accessToken && !superadminToken) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ---- Verify token -------------------------------------------------
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
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('access_token');
    res.cookies.delete('superadmin_access_token');
    return res;
  }

  // ---- Determine role ------------------------------------------------
  const role = isSuperAdmin
    ? 'superadmin'
    : payload.is_owner
    ? 'owner'
    : payload.is_employee
    ? 'employee'
    : 'unknown';

  // ---- Block cross-role access ---------------------------------------
  if (pathname.startsWith('/admin') && role !== 'superadmin') {
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/owner') && role !== 'owner') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/employee') && role !== 'employee') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};