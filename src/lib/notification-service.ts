/**
 * Notification Service
 * Handles creation and retrieval of user notifications
 */

import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  orgId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        organizationId: input.orgId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

/**
 * Get paginated notifications for a user (newest first)
 */
export async function getNotifications(
  userId: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const skip = (page - 1) * pageSize;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return {
      notifications: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
}

/**
 * Mark a specific notification as read
 * Validates ownership before marking
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    // Validate ownership
    if (!notification || notification.userId !== userId) {
      return false;
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return 0;
  }
}
