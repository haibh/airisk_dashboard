import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  validationError,
} from '@/lib/api-error-handler';
import {
  updateWebhookSchema,
  validateBody,
  formatZodErrors,
} from '@/lib/api-validation-schemas';

/**
 * Validate URL is not private IP
 */
function isPrivateIP(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

    const ipv4Regex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
    const match = hostname.match(ipv4Regex);

    if (match) {
      const [, a, b] = match.map(Number);
      if (a === 10) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 0) return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * GET /api/webhooks/[id] - Get webhook details with recent deliveries
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can view webhooks');
    }

    const { id } = await params;

    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!webhook) {
      return notFoundError('Webhook not found');
    }

    return NextResponse.json({ success: true, data: webhook });
  } catch (error) {
    return handleApiError(error, 'fetching webhook details');
  }
}

/**
 * PUT /api/webhooks/[id] - Update webhook (ADMIN only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can update webhooks');
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

    const body = await request.json();
    const validation = validateBody(updateWebhookSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { url, events, isActive, description } = validation.data;

    // Validate URL if provided
    if (url && isPrivateIP(url)) {
      return validationError('Webhook URL cannot point to private IP ranges');
    }

    const updated = await prisma.webhook.update({
      where: { id },
      data: {
        ...(url && { url }),
        ...(events && { events }),
        ...(isActive !== undefined && { isActive }),
        ...(description !== undefined && { description }),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'WEBHOOK',
        entityId: id,
        action: 'UPDATE',
        newValues: { url, events, isActive, description },
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error, 'updating webhook');
  }
}

/**
 * DELETE /api/webhooks/[id] - Delete webhook (ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can delete webhooks');
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

    // Delete webhook (cascades to deliveries)
    await prisma.webhook.delete({
      where: { id },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'WEBHOOK',
        entityId: id,
        action: 'DELETE',
        oldValues: { url: webhook.url },
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    return handleApiError(error, 'deleting webhook');
  }
}
