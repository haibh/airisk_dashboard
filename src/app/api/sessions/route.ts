import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';
import { getActiveSessions, getUserSessions } from '@/lib/active-session-tracker-service';
import { paginationSchema } from '@/lib/api-validation-schemas';

/**
 * GET /api/sessions
 * List active sessions
 * - ADMIN: sees all org sessions with pagination
 * - Regular users: see only their own sessions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return unauthorizedError(request);
    }

    const isAdmin = hasMinimumRole(session.user.role, 'ADMIN');

    if (isAdmin) {
      // Admin sees all org sessions (paginated)
      const searchParams = request.nextUrl.searchParams;
      const queryParams = Object.fromEntries(
        Object.entries({
          page: searchParams.get('page'),
          pageSize: searchParams.get('pageSize'),
        }).filter(([, v]) => v !== null)
      );

      const validation = paginationSchema.safeParse(queryParams);
      const { page = 1, pageSize = 20 } = validation.success ? validation.data : { page: 1, pageSize: 20 };

      const { sessions, total } = await getActiveSessions(
        session.user.organizationId,
        page,
        pageSize
      );

      return NextResponse.json({
        success: true,
        data: sessions,
        total,
        page,
        pageSize,
      });
    } else {
      // Regular user sees only their own sessions
      const sessions = await getUserSessions(session.user.id);

      return NextResponse.json({
        success: true,
        data: sessions,
      });
    }
  } catch (error) {
    return handleApiError(error, 'fetching active sessions', request);
  }
}
