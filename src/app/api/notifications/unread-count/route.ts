import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { getUnreadCount } from '@/lib/notification-service';

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for current user
 */
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const count = await getUnreadCount(session.user.id);

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('GET /api/notifications/unread-count error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
