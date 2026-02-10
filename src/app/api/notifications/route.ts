import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '@/lib/notification-service';

/**
 * GET /api/notifications
 * Get paginated list of notifications for current user (newest first)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // Validate pagination params
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const result = await getNotifications(session.user.id, page, pageSize);

    return NextResponse.json({
      success: true,
      data: result.notifications,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications
 * Mark notification(s) as read
 * Body: { ids: string[] } or { all: true }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Mark all as read
    if (body.all === true) {
      const count = await markAllAsRead(session.user.id);
      return NextResponse.json({
        success: true,
        message: `Marked ${count} notifications as read`,
        data: { count },
      });
    }

    // Mark specific notifications as read
    if (Array.isArray(body.ids) && body.ids.length > 0) {
      const results = await Promise.all(
        body.ids.map((id: string) => markAsRead(id, session.user.id))
      );

      const successCount = results.filter((r) => r === true).length;

      return NextResponse.json({
        success: true,
        message: `Marked ${successCount} notifications as read`,
        data: { count: successCount },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
