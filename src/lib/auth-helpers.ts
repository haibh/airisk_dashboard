import bcrypt from 'bcryptjs';
import { getServerSession as nextGetServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get the current server session
 * Wrapper around next-auth getServerSession with our auth options
 */
export async function getServerSession() {
  return nextGetServerSession(authOptions);
}

/**
 * Check if user has required role
 * @param userRole - User's current role
 * @param requiredRoles - Array of allowed roles
 * @returns True if user has one of the required roles
 */
export function hasRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Role hierarchy for authorization
 * Higher index = higher privileges
 */
const ROLE_HIERARCHY = [
  'VIEWER',
  'AUDITOR',
  'ASSESSOR',
  'RISK_MANAGER',
  'ADMIN',
] as const;

/**
 * Check if user role meets minimum required role
 * @param userRole - User's current role
 * @param minRole - Minimum required role
 * @returns True if user role meets or exceeds minimum
 */
export function hasMinimumRole(
  userRole: string,
  minRole: string
): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole as any);
  const minIndex = ROLE_HIERARCHY.indexOf(minRole as any);

  if (userIndex === -1 || minIndex === -1) {
    return false;
  }

  return userIndex >= minIndex;
}
