import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUser } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const user = await getUser();
  const { pathname } = request.nextUrl;

  // If user is logged in and tries to access the login page, redirect to dashboard
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login page
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
