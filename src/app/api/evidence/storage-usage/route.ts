import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError } from '@/lib/api-error-handler';
import { getStorageUsage } from '@/lib/organization-storage-quota-service';

/**
 * GET /api/evidence/storage-usage - Get organization storage usage
 * Requires: ADMIN role
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - requires ADMIN
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only Admins can view storage usage');
    }

    // Get storage usage for the organization
    const usage = await getStorageUsage(session.user.organizationId);

    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    return handleApiError(error, 'fetching storage usage');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
