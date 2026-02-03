import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale } from '@/i18n/request';

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Public paths that don't require authentication
const publicPaths = ['/', '/login', '/forgot-password'];

// Check if path is public
function isPublicPath(pathname: string): boolean {
  // Remove locale prefix to check base path
  const pathWithoutLocale = pathname.replace(/^\/(en|vi)/, '');
  return publicPaths.some((path) => pathWithoutLocale === path || pathWithoutLocale === '');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return intlMiddleware(request);
  }

  // Check if path is public
  if (isPublicPath(pathname)) {
    return intlMiddleware(request);
  }

  // Check authentication for protected routes
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If not authenticated, redirect to login
  if (!token) {
    const locale = pathname.match(/^\/(en|vi)/)?.[1] || defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, continue with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Internal Next.js paths
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
