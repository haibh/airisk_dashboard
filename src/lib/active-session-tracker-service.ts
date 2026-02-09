import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Parse user agent string into device info
 * Simple regex-based parsing without external dependencies
 */
function parseUserAgent(userAgent?: string | null): string {
  if (!userAgent) return 'Unknown Device';

  const ua = userAgent.toLowerCase();
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect browser
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  // Detect OS
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return `${browser} on ${os}`;
}

interface SessionInfo {
  sessionId: string;
  userId: string;
  organizationId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo: string;
  expiresAt: Date;
}

/**
 * Create a new active session
 * @returns sessionId (cuid)
 */
export async function createSession(
  userId: string,
  organizationId: string,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<string> {
  const sessionId = generateSessionId();
  const deviceInfo = parseUserAgent(userAgent);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

  await prisma.activeSession.create({
    data: {
      id: sessionId,
      sessionToken: sessionId,
      userId,
      organizationId,
      ipAddress,
      userAgent,
      deviceInfo,
      expiresAt,
      lastActivityAt: new Date(),
    },
  });

  return sessionId;
}

/**
 * Revoke a session (mark as revoked)
 */
export async function revokeSession(
  sessionId: string,
  revokedById: string
): Promise<void> {
  await prisma.activeSession.update({
    where: { id: sessionId },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy: revokedById,
    },
  });
}

/**
 * Revoke all sessions for a user (bulk revoke)
 */
export async function revokeAllUserSessions(
  userId: string,
  revokedById: string
): Promise<number> {
  const result = await prisma.activeSession.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy: revokedById,
    },
  });

  return result.count;
}

/**
 * Get active sessions for an organization (paginated)
 * Includes user info
 */
export async function getActiveSessions(
  organizationId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ sessions: any[]; total: number }> {
  const skip = (page - 1) * pageSize;

  const [sessions, total] = await Promise.all([
    prisma.activeSession.findMany({
      where: {
        organizationId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { lastActivityAt: 'desc' },
      take: pageSize,
      skip,
    }),
    prisma.activeSession.count({
      where: {
        organizationId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    }),
  ]);

  return { sessions, total };
}

/**
 * Get user's own sessions
 */
export async function getUserSessions(userId: string): Promise<any[]> {
  return prisma.activeSession.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActivityAt: 'desc' },
  });
}

/**
 * Check if a session is valid (not revoked, not expired)
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  const session = await prisma.activeSession.findUnique({
    where: { id: sessionId },
    select: {
      isRevoked: true,
      expiresAt: true,
    },
  });

  if (!session) return false;
  if (session.isRevoked) return false;
  if (session.expiresAt < new Date()) return false;

  return true;
}

/**
 * Update last activity timestamp (throttled to avoid excessive writes)
 */
export async function updateLastActivity(sessionId: string): Promise<void> {
  // In production, this should be throttled (e.g., only update if > 5min since last update)
  // For simplicity, we update every time here
  await prisma.activeSession.update({
    where: { id: sessionId },
    data: { lastActivityAt: new Date() },
  });
}

/**
 * Cleanup expired sessions (to be called periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h ago

  const result = await prisma.activeSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { createdAt: { lt: cutoffDate } },
      ],
    },
  });

  return result.count;
}
