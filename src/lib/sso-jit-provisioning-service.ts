/**
 * SSO Just-In-Time (JIT) User Provisioning Service
 * Handles automatic user creation and updates on first SAML login
 */

import { prisma } from './db';
import { logger } from './logger';
import type { UserRole } from '@prisma/client';

export interface SAMLProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  id: string; // External IdP user ID (nameId)
  groups?: string[];
}

export interface JITProvisioningResult {
  userId: string;
  isNewUser: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    organizationId: string;
  };
}

/**
 * Provision or update user via JIT on SAML login
 * Creates user if doesn't exist, updates if exists
 */
export async function jitProvisionUser(
  organizationId: string,
  samlProfile: SAMLProfile
): Promise<JITProvisioningResult> {
  const { email, firstName, lastName, id: externalId } = samlProfile;

  try {
    // Get SSO connection for default role and domain validation
    const ssoConnection = await prisma.sSOConnection.findUnique({
      where: { organizationId },
    });

    if (!ssoConnection || !ssoConnection.isActive) {
      throw new Error('SSO connection not found or inactive');
    }

    // Validate email domain
    const emailDomain = email.split('@')[1];
    if (!ssoConnection.allowedDomains.includes(emailDomain)) {
      logger.warn('Email domain not allowed for SSO', {
        context: 'jit-provision',
        data: { email, emailDomain, allowedDomains: ssoConnection.allowedDomains },
      });
      throw new Error(`Email domain ${emailDomain} not allowed for SSO`);
    }

    // Build full name from firstName and lastName
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // User exists - update SSO fields and last login
      if (existingUser.organizationId !== organizationId) {
        throw new Error('User belongs to different organization');
      }

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: fullName || existingUser.name,
          ssoProvider: 'saml',
          ssoExternalId: externalId,
          lastLoginAt: new Date(),
          isActive: true, // Reactivate if was deactivated
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: 'SSO_USER_LOGIN',
          entityType: 'User',
          entityId: updatedUser.id,
          userId: updatedUser.id,
          organizationId,
          newValues: { ssoExternalId: externalId },
        },
      });

      logger.info('Existing user logged in via SSO', {
        context: 'jit-provision',
        data: { userId: updatedUser.id, email },
      });

      return {
        userId: updatedUser.id,
        isNewUser: false,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          organizationId: updatedUser.organizationId,
        },
      };
    }

    // User doesn't exist - create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: fullName,
        role: ssoConnection.defaultRole,
        organizationId,
        ssoProvider: 'saml',
        ssoExternalId: externalId,
        passwordHash: null, // SSO users have no password
        isActive: true,
        lastLoginAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'SSO_USER_CREATED',
        entityType: 'User',
        entityId: newUser.id,
        userId: newUser.id,
        organizationId,
        newValues: {
          email: newUser.email,
          role: newUser.role,
          ssoProvider: 'saml',
          ssoExternalId: externalId,
        },
      },
    });

    logger.info('New user created via SSO JIT provisioning', {
      context: 'jit-provision',
      data: { userId: newUser.id, email, role: newUser.role },
    });

    return {
      userId: newUser.id,
      isNewUser: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        organizationId: newUser.organizationId,
      },
    };
  } catch (error) {
    logger.error('JIT provisioning failed', error, {
      context: 'jit-provision',
      data: { email, organizationId },
    });
    throw error;
  }
}
