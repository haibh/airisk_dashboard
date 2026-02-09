/**
 * SAML Callback Helper
 * Creates NextAuth session after successful SAML authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const orgId = searchParams.get('orgId');

    if (!userId || !orgId) {
      const loginUrl = new URL('/login', process.env.NEXTAUTH_URL!);
      loginUrl.searchParams.set('error', 'Invalid SSO callback');
      return NextResponse.redirect(loginUrl.toString());
    }

    // Verify user exists
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId: orgId },
      include: { organization: true },
    });

    if (!user || !user.isActive) {
      const loginUrl = new URL('/login', process.env.NEXTAUTH_URL!);
      loginUrl.searchParams.set('error', 'User not found or inactive');
      return NextResponse.redirect(loginUrl.toString());
    }

    logger.info('SAML callback - creating session', {
      context: 'saml-callback',
      data: { userId, email: user.email },
    });

    // Create a session token that NextAuth can use
    // For now, redirect to a page that will handle client-side signIn
    const sessionUrl = new URL('/api/auth/session/sso', process.env.NEXTAUTH_URL!);
    sessionUrl.searchParams.set('userId', userId);
    sessionUrl.searchParams.set('email', user.email);
    sessionUrl.searchParams.set('name', user.name || '');
    sessionUrl.searchParams.set('role', user.role);
    sessionUrl.searchParams.set('orgId', user.organizationId);
    sessionUrl.searchParams.set('orgName', user.organization.name);

    return NextResponse.redirect(sessionUrl.toString());
  } catch (error) {
    logger.error('SAML callback failed', error, {
      context: 'saml-callback',
    });

    const loginUrl = new URL('/login', process.env.NEXTAUTH_URL!);
    loginUrl.searchParams.set('error', 'SSO callback failed');
    return NextResponse.redirect(loginUrl.toString());
  }
}
