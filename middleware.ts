import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Allow unauthenticated access to auth pages, API routes, and static assets
  const publicPaths = [
    '/auth',
    '/api',
    '/_next',
    '/favicon.ico',
    '/favicon.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/site.webmanifest',
    '/placeholder-logo.png',
    '/placeholder-logo.svg',
    '/placeholder-user.jpg',
    '/placeholder.jpg',
    '/placeholder.svg',
    '/sounds',
    '/public',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
    '/assets',
    '/fonts',
    '/images',
    '/static',
  ];
  const isPublic = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  if (isPublic) {
    // Allow access to public paths
    return res;
  }

  // If not authenticated, redirect to sign in
  if (!session) {
    const redirectUrl = new URL('/auth/signin', req.url);
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated, allow access
  return res;
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|favicon.png|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png|site.webmanifest|placeholder-logo.png|placeholder-logo.svg|placeholder-user.jpg|placeholder.jpg|placeholder.svg|sounds|public|robots.txt|sitemap.xml|manifest.json|assets|fonts|images|static|api|auth).*)',
    '/auth/:path*',
    '/api/:path*',
  ],
}; 