import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
} from '@/lib/api-error-handler';
import { z } from 'zod';

const deliveryFilterSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

/**
 * GET /api/webhooks/[id]/deliveries - Get paginated delivery log (ADMIN only)
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
      return forbiddenError('Only administrators can view webhook deliveries');
    }

    const { id } = await params;

    // Verify webhook exists and belongs to org
    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!webhook) {
      return notFoundError('Webhook not found');
    }

    const { searchParams } = new URL(request.url);
    const params_data = Object.fromEntries(searchParams.entries());
    const validation = deliveryFilterSchema.safeParse(params_data);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { page, pageSize } = validation.data;
    const skip = (page - 1) * pageSize;

    const [total, deliveries] = await Promise.all([
      prisma.webhookDelivery.count({
        where: { webhookId: id },
      }),
      prisma.webhookDelivery.findMany({
        where: { webhookId: id },
        select: {
          id: true,
          eventType: true,
          status: true,
          responseStatus: true,
          duration: true,
          attempt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: deliveries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error, 'fetching webhook deliveries');
  }
}
