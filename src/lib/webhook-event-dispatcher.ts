/**
 * Webhook Event Dispatcher
 * Fire-and-forget webhook event emission to active webhooks
 */

import { prisma } from '@/lib/db';
import { deliverWebhook } from '@/lib/webhook-delivery-worker';

/**
 * Emit webhook event to all active webhooks for organization
 * @param orgId - Organization ID
 * @param eventType - Event type string (e.g., 'ai_system.created')
 * @param data - Event data payload
 */
export function emitWebhookEvent(
  orgId: string,
  eventType: string,
  data: object
): void {
  // Fire and forget - don't await
  (async () => {
    try {
      // Query active webhooks that listen to this event
      const webhooks = await prisma.webhook.findMany({
        where: {
          organizationId: orgId,
          isActive: true,
          events: {
            has: eventType,
          },
        },
        select: {
          id: true,
          url: true,
          secret: true,
        },
      });

      if (webhooks.length === 0) {
        return;
      }

      // Standard payload format
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        organization_id: orgId,
        data,
      };

      // Deliver to all webhooks in parallel (fire and forget)
      const deliveryPromises = webhooks.map((webhook) =>
        deliverWebhook(webhook, eventType, payload).catch(() => {
          /* Ignore individual delivery errors */
        })
      );

      await Promise.allSettled(deliveryPromises);
    } catch (error) {
      // Silently fail - webhook delivery should not block main operations
      console.error('Webhook event dispatch error:', error);
    }
  })();
}
