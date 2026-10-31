import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

// Optimistic check only: no cookie, no dashboard. Pages still verify the session on the server.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/bookings/:path*', '/admin/:path*'],
};
