// middleware.ts
import { NextResponse } from 'next/server';

const PUBLIC_FILE_EXTENSIONS = [
  'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'css', 'js'
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static files, API routes, _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    PUBLIC_FILE_EXTENSIONS.some(ext => pathname.endsWith(`.${ext}`))
  ) {
    return NextResponse.next();
  }

  // Let client (RouteGuard) handle auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};