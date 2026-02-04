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
  const pathWithoutLocale = pathname.replace(/^\/(en|vi)/, '');
  return publicPaths.some((path) => pathWithoutLocale === path || pathWithoutLocale === '');
}

// Generate unique correlation ID for request tracking (Edge-compatible)
function generateCorrelationId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `req-${Date.now().toString(36)}-${hex}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate correlation ID for request tracking
  const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId();

  // Skip auth check for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    const response = intlMiddleware(request);
    response.headers.set('x-correlation-id', correlationId);
    return response;
  }

  // Skip auth check for API routes (handled by individual API route handlers)
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('x-correlation-id', correlationId);
    return response;
  }

  // Check if path is public
  if (isPublicPath(pathname)) {
    const response = intlMiddleware(request);
    response.headers.set('x-correlation-id', correlationId);
    return response;
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

  // Authenticated — continue with i18n
  const response = intlMiddleware(request);
  response.headers.set('x-correlation-id', correlationId);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
