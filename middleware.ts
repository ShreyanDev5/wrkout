import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const authRecoveryRoutes = ['/auth/reset-password', '/auth/verify'];
  const isAuthRecoveryRoute = authRecoveryRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Auth routes handling
  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (session && !isAuthRecoveryRoute) {
      // If user is signed in and tries to access auth pages, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }
    return res;
  }

  // Protected routes handling - only protect specific routes that require auth
  const protectedRoutes = ['/dashboard', '/profile', '/settings/premium'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // If user is not signed in and tries to access protected routes, redirect to sign in
    const redirectUrl = new URL('/auth/signin', req.url);
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/profile/:path*',
    '/settings/premium/:path*'
  ]
}; 
