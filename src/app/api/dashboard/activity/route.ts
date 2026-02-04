import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, notFoundError } from '@/lib/api-error-handler';

// Type for activity with user
interface ActivityWithUser {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  oldValues: unknown;
  newValues: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * GET /api/dashboard/activity
 * Returns recent activity feed (audit logs) for the organization, limited to 10 items
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return unauthorizedError();
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user || !user.organizationId) {
      return notFoundError('User or organization');
    }

    const organizationId = user.organizationId;

    // Get recent audit logs with user information
    const activities = await prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Format activities for frontend
    const formattedActivities = activities.map((activity: ActivityWithUser) => {
      // Create human-readable description
      let description = '';
      const userName = activity.user.name || activity.user.email;

      switch (activity.action) {
        case 'CREATE':
          description = `${userName} created a new ${activity.entityType.toLowerCase().replace('_', ' ')}`;
          break;
        case 'UPDATE':
          description = `${userName} updated ${activity.entityType.toLowerCase().replace('_', ' ')}`;
          break;
        case 'DELETE':
          description = `${userName} deleted ${activity.entityType.toLowerCase().replace('_', ' ')}`;
          break;
        case 'APPROVE':
          description = `${userName} approved ${activity.entityType.toLowerCase().replace('_', ' ')}`;
          break;
        case 'SUBMIT':
          description = `${userName} submitted ${activity.entityType.toLowerCase().replace('_', ' ')}`;
          break;
        case 'ASSIGN':
          description = `${userName} assigned ${activity.entityType.toLowerCase().replace('_', ' ')}`;
          break;
        default:
          description = `${userName} performed ${activity.action} on ${activity.entityType.toLowerCase().replace('_', ' ')}`;
      }

      return {
        id: activity.id,
        action: activity.action,
        entityType: activity.entityType,
        entityId: activity.entityId,
        description,
        userName: userName,
        userId: activity.userId,
        timestamp: activity.createdAt.toISOString(),
        metadata: {
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          hasChanges: !!(activity.oldValues || activity.newValues),
        },
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      total: formattedActivities.length,
    });
  } catch (error) {
    return handleApiError(error, 'fetching activity feed');
  }
}
