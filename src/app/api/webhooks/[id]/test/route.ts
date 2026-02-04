import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
} from '@/lib/api-error-handler';
import { deliverWebhook } from '@/lib/webhook-delivery-worker';

/**
 * POST /api/webhooks/[id]/test - Send test event (ADMIN only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can test webhooks');
    }

    const { id } = await params;

    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!webhook) {
      return notFoundError('Webhook not found');
    }

    // Send test event with sample payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      organization_id: webhook.organizationId,
      data: {
        message: 'This is a test webhook event',
        test: true,
      },
    };

    const result = await deliverWebhook(
      {
        id: webhook.id,
        url: webhook.url,
        secret: webhook.secret,
      },
      'webhook.test',
      testPayload
    );

    return NextResponse.json({
      success: true,
      data: {
        deliveryId: result.deliveryId,
        status: result.status,
        responseStatus: result.responseStatus,
      },
    });
  } catch (error) {
    return handleApiError(error, 'testing webhook');
  }
}
