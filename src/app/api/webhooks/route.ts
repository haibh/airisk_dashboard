import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  validationError,
} from '@/lib/api-error-handler';
import {
  createWebhookSchema,
  validateBody,
  formatZodErrors,
} from '@/lib/api-validation-schemas';
import crypto from 'crypto';

/**
 * Validate URL is not private IP
 */
function isPrivateIP(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;

    // Check for localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    // Check for private IP ranges
    const ipv4Regex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
    const match = hostname.match(ipv4Regex);

    if (match) {
      const [, a, b] = match.map(Number);

      // 10.x.x.x
      if (a === 10) return true;

      // 172.16-31.x.x
      if (a === 172 && b >= 16 && b <= 31) return true;

      // 192.168.x.x
      if (a === 192 && b === 168) return true;

      // 0.0.0.0
      if (a === 0) return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * GET /api/webhooks - List webhooks (ADMIN only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can view webhooks');
    }

    const webhooks = await prisma.webhook.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        _count: {
          select: { deliveries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: webhooks });
  } catch (error) {
    return handleApiError(error, 'fetching webhooks');
  }
}

/**
 * POST /api/webhooks - Create webhook (ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can create webhooks');
    }

    const body = await request.json();
    const validation = validateBody(createWebhookSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { url, events, description } = validation.data;

    // Validate not private IP
    if (isPrivateIP(url)) {
      return validationError('Webhook URL cannot point to private IP ranges');
    }

    // Check limit: max 10 per org
    const count = await prisma.webhook.count({
      where: {
        organizationId: session.user.organizationId,
      },
    });

    if (count >= 10) {
      return validationError('Maximum of 10 webhooks per organization');
    }

    // Generate random 32-byte secret
    const secret = crypto.randomBytes(32).toString('hex');

    // Create webhook
    const webhook = await prisma.webhook.create({
      data: {
        url,
        secret,
        events,
        description: description ?? null,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'WEBHOOK',
        entityId: webhook.id,
        action: 'CREATE',
        newValues: { url, events },
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(
      { success: true, data: webhook },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'creating webhook');
  }
}
