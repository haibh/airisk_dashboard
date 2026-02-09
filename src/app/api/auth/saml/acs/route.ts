/**
 * SAML ACS (Assertion Consumer Service) Endpoint
 * Receives and validates SAML response from IdP, performs JIT provisioning
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { getSAMLController } from '@/lib/saml-jackson-service';
import { jitProvisionUser } from '@/lib/sso-jit-provisioning-service';


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const samlResponse = formData.get('SAMLResponse') as string;
    const relayState = formData.get('RelayState') as string;

    if (!samlResponse) {
      logger.error('Missing SAMLResponse in ACS request', {
        context: 'saml-acs',
      });
      return new NextResponse('Missing SAMLResponse', { status: 400 });
    }

    logger.info('SAML ACS request received', {
      context: 'saml-acs',
      data: { hasRelayState: !!relayState },
    });

    // Get Jackson SAML controller
    const samlController = await getSAMLController();

    // Validate SAML response via Jackson OAuth flow
    // Jackson v5+ uses samlResponse() on OAuthController (types incomplete)
    const samlProfile = await (samlController as any).samlResponse({
      SAMLResponse: samlResponse,
      RelayState: relayState,
    });

    if (!samlProfile || !samlProfile.email) {
      logger.error('Invalid SAML profile returned', {
        context: 'saml-acs',
        data: { profile: samlProfile },
      });
      return new NextResponse('Invalid SAML assertion', { status: 400 });
    }

    logger.info('SAML response validated', {
      context: 'saml-acs',
      data: {
        email: samlProfile.email,
        nameId: samlProfile.id,
      },
    });

    // Extract organization ID from relay state
    const organizationId = relayState;

    if (!organizationId) {
      logger.error('Missing organization ID in relay state', {
        context: 'saml-acs',
      });
      return new NextResponse('Invalid state', { status: 400 });
    }

    // JIT provision user
    const provisionResult = await jitProvisionUser(organizationId, {
      email: samlProfile.email,
      firstName: samlProfile.firstName,
      lastName: samlProfile.lastName,
      id: samlProfile.id,
      groups: samlProfile.groups,
    });

    logger.info('User provisioned via SSO', {
      context: 'saml-acs',
      data: {
        userId: provisionResult.userId,
        email: provisionResult.user.email,
        isNewUser: provisionResult.isNewUser,
      },
    });

    // Create NextAuth session by redirecting to callback with token
    // We'll encode user info in a temporary token that can be exchanged
    const callbackUrl = new URL('/api/auth/callback/credentials', process.env.NEXTAUTH_URL!);

    // Instead of using NextAuth signIn here (which doesn't work server-side),
    // we'll redirect to a page that handles the client-side session creation
    const redirectUrl = new URL('/api/auth/saml/callback', process.env.NEXTAUTH_URL!);
    redirectUrl.searchParams.set('userId', provisionResult.userId);
    redirectUrl.searchParams.set('orgId', organizationId);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error('SAML ACS failed', error, {
      context: 'saml-acs',
    });

    // Redirect to login with error
    const loginUrl = new URL('/login', process.env.NEXTAUTH_URL!);
    loginUrl.searchParams.set('error', 'SSO authentication failed');
    return NextResponse.redirect(loginUrl.toString());
  }
}
