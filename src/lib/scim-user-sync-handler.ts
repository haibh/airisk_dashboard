/**
 * SCIM User Sync Handler
 * Handles SCIM 2.0 user provisioning events from IdP
 */

import { prisma } from './db';
import { logger } from './logger';
import type { UserRole } from '@prisma/client';

export interface SCIMUser {
  userName: string; // Email
  name?: {
    givenName?: string;
    familyName?: string;
  };
  active?: boolean;
  externalId?: string;
  emails?: Array<{ value: string; primary?: boolean }>;
}

/**
 * Handle SCIM user create event
 * Creates new user in organization
 */
export async function handleScimUserCreate(
  organizationId: string,
  scimUser: SCIMUser
): Promise<{ id: string; userName: string }> {
  try {
    const email = scimUser.userName || scimUser.emails?.find((e) => e.primary)?.value;

    if (!email) {
      throw new Error('SCIM user missing email/userName');
    }

    // Get SSO connection for default role
    const ssoConnection = await prisma.sSOConnection.findUnique({
      where: { organizationId },
    });

    if (!ssoConnection) {
      throw new Error('SSO connection not found');
    }

    // Build full name
    const fullName = scimUser.name
      ? [scimUser.name.givenName, scimUser.name.familyName].filter(Boolean).join(' ')
      : null;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        role: ssoConnection.defaultRole,
        organizationId,
        ssoProvider: 'saml',
        ssoExternalId: scimUser.externalId || email,
        passwordHash: null,
        isActive: scimUser.active !== false,
        ssoManagedFields: ['name', 'isActive'], // Fields managed by SCIM
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'SCIM_USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        organizationId,
        newValues: {
          email: user.email,
          role: user.role,
          ssoExternalId: user.ssoExternalId,
        },
      },
    });

    logger.info('SCIM user created', {
      context: 'scim-sync',
      data: { userId: user.id, email },
    });

    return { id: user.id, userName: user.email };
  } catch (error) {
    logger.error('SCIM user create failed', error, {
      context: 'scim-sync',
      data: { organizationId, userName: scimUser.userName },
    });
    throw error;
  }
}

/**
 * Handle SCIM user update event
 * Updates existing user's managed fields only
 */
export async function handleScimUserUpdate(
  organizationId: string,
  userId: string,
  scimUser: SCIMUser
): Promise<{ id: string; userName: string }> {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Build update data (only managed fields)
    const updateData: Record<string, any> = {};

    if (scimUser.name) {
      const fullName = [scimUser.name.givenName, scimUser.name.familyName]
        .filter(Boolean)
        .join(' ');
      if (user.ssoManagedFields.includes('name')) {
        updateData.name = fullName || null;
      }
    }

    if (scimUser.active !== undefined && user.ssoManagedFields.includes('isActive')) {
      updateData.isActive = scimUser.active;
    }

    if (scimUser.externalId) {
      updateData.ssoExternalId = scimUser.externalId;
    }

    const oldValues = { name: user.name, isActive: user.isActive };

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'SCIM_USER_UPDATED',
        entityType: 'User',
        entityId: updatedUser.id,
        userId: updatedUser.id,
        organizationId,
        oldValues,
        newValues: updateData,
      },
    });

    logger.info('SCIM user updated', {
      context: 'scim-sync',
      data: { userId: updatedUser.id, email: updatedUser.email },
    });

    return { id: updatedUser.id, userName: updatedUser.email };
  } catch (error) {
    logger.error('SCIM user update failed', error, {
      context: 'scim-sync',
      data: { organizationId, userId },
    });
    throw error;
  }
}

/**
 * Handle SCIM user deactivate event
 * Sets user as inactive (soft delete)
 */
export async function handleScimUserDeactivate(
  organizationId: string,
  userId: string
): Promise<void> {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Deactivate user
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'SCIM_USER_DEACTIVATED',
        entityType: 'User',
        entityId: userId,
        userId,
        organizationId,
        oldValues: { isActive: true },
        newValues: { isActive: false },
      },
    });

    logger.info('SCIM user deactivated', {
      context: 'scim-sync',
      data: { userId, email: user.email },
    });
  } catch (error) {
    logger.error('SCIM user deactivate failed', error, {
      context: 'scim-sync',
      data: { organizationId, userId },
    });
    throw error;
  }
}
