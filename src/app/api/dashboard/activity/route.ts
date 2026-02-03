import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

/**
 * GET /api/dashboard/activity
 * Returns recent activity feed (audit logs) for the organization, limited to 10 items
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: 'User or organization not found' },
        { status: 404 }
      );
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
    const formattedActivities = activities.map((activity: any) => {
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
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
