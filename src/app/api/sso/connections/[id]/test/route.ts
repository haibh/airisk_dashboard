/**
 * SSO Connection Test API
 * ADMIN only - tests SSO connection by validating IdP configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
} from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { getConnectionAPIController } from '@/lib/saml-jackson-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const { id: connectionId } = await params;
    const organizationId = session.user.organizationId;

    // Get SSO connection
    const ssoConnection = await prisma.sSOConnection.findFirst({
      where: { id: connectionId, organizationId },
    });

    if (!ssoConnection) {
      return notFoundError('SSO connection', request);
    }

    logger.info('Testing SSO connection', {
      context: 'sso-test',
      data: { connectionId, organizationId },
    });

    // Test results
    const testResults = {
      success: true,
      checks: [] as Array<{ name: string; passed: boolean; message?: string }>,
    };

    // Check 1: Validate IdP configuration
    if (!ssoConnection.idpEntityId || !ssoConnection.idpSsoUrl) {
      testResults.checks.push({
        name: 'IdP Configuration',
        passed: false,
        message: 'Missing IdP Entity ID or SSO URL',
      });
      testResults.success = false;
    } else {
      testResults.checks.push({
        name: 'IdP Configuration',
        passed: true,
        message: 'IdP configuration is valid',
      });
    }

    // Check 2: Validate certificate
    if (!ssoConnection.idpCertificate) {
      testResults.checks.push({
        name: 'IdP Certificate',
        passed: false,
        message: 'Missing IdP certificate',
      });
      testResults.success = false;
    } else {
      // Basic PEM format check
      const isPEM =
        ssoConnection.idpCertificate.includes('BEGIN CERTIFICATE') &&
        ssoConnection.idpCertificate.includes('END CERTIFICATE');

      testResults.checks.push({
        name: 'IdP Certificate',
        passed: isPEM,
        message: isPEM ? 'Certificate format is valid' : 'Invalid PEM format',
      });

      if (!isPEM) {
        testResults.success = false;
      }
    }

    // Check 3: Validate allowed domains
    if (!ssoConnection.allowedDomains || ssoConnection.allowedDomains.length === 0) {
      testResults.checks.push({
        name: 'Allowed Domains',
        passed: false,
        message: 'No allowed email domains configured',
      });
      testResults.success = false;
    } else {
      testResults.checks.push({
        name: 'Allowed Domains',
        passed: true,
        message: `${ssoConnection.allowedDomains.length} domain(s) configured`,
      });
    }

    // Check 4: Validate Jackson connection
    try {
      const connectionController = await getConnectionAPIController();
      const connections = await connectionController.getConnections({
        tenant: organizationId,
        product: 'airm-ip',
      });

      if (!connections || connections.length === 0) {
        testResults.checks.push({
          name: 'Jackson SAML Connection',
          passed: false,
          message: 'SAML connection not found in Jackson',
        });
        testResults.success = false;
      } else {
        testResults.checks.push({
          name: 'Jackson SAML Connection',
          passed: true,
          message: 'SAML connection is configured',
        });
      }
    } catch (error) {
      testResults.checks.push({
        name: 'Jackson SAML Connection',
        passed: false,
        message: 'Failed to validate Jackson connection',
      });
      testResults.success = false;
    }

    // Check 5: Validate metadata URL if provided
    if (ssoConnection.metadataUrl) {
      try {
        const metadataResponse = await fetch(ssoConnection.metadataUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'AIRM-IP-SSO-Test/1.0' },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (metadataResponse.ok) {
          testResults.checks.push({
            name: 'IdP Metadata URL',
            passed: true,
            message: 'Metadata URL is reachable',
          });
        } else {
          testResults.checks.push({
            name: 'IdP Metadata URL',
            passed: false,
            message: `Metadata URL returned status ${metadataResponse.status}`,
          });
          testResults.success = false;
        }
      } catch (error) {
        testResults.checks.push({
          name: 'IdP Metadata URL',
          passed: false,
          message: 'Metadata URL is not reachable',
        });
        testResults.success = false;
      }
    }

    logger.info('SSO connection test completed', {
      context: 'sso-test',
      data: { connectionId, success: testResults.success },
    });

    return NextResponse.json(testResults, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'testing SSO connection', request);
  }
}
