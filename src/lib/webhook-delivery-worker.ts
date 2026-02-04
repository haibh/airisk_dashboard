/**
 * Webhook Delivery Worker
 * Handles HTTP POST delivery of webhook events with retry logic
 */

import { prisma } from '@/lib/db';
import { signPayload } from '@/lib/webhook-signature-generator';
import { DeliveryStatus } from '@prisma/client';

interface WebhookTarget {
  id: string;
  url: string;
  secret: string;
}

interface DeliveryResult {
  deliveryId: string;
  status: DeliveryStatus;
  responseStatus?: number;
}

/**
 * Calculate next retry delay (exponential backoff)
 */
function getRetryDelay(attempt: number): number {
  const delays = [60_000, 300_000, 1_800_000]; // 1min, 5min, 30min
  return delays[Math.min(attempt - 1, delays.length - 1)];
}

/**
 * Deliver webhook event via HTTP POST
 * @param webhook - Webhook configuration
 * @param eventType - Event type string
 * @param payload - Event data object
 * @returns Delivery result
 */
export async function deliverWebhook(
  webhook: WebhookTarget,
  eventType: string,
  payload: object
): Promise<DeliveryResult> {
  const payloadString = JSON.stringify(payload);
  const signature = signPayload(payloadString, webhook.secret);

  // Create delivery record
  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      eventType,
      payload: payload as any,
      status: DeliveryStatus.PENDING,
      attempt: 1,
    },
  });

  const startTime = Date.now();

  try {
    // Create AbortController for 10 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'X-Webhook-ID': delivery.id,
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const responseBody = await response.text().catch(() => '');

    if (response.ok) {
      // Success
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.SUCCESS,
          responseStatus: response.status,
          responseBody: responseBody.substring(0, 5000),
          duration,
        },
      });

      return {
        deliveryId: delivery.id,
        status: DeliveryStatus.SUCCESS,
        responseStatus: response.status,
      };
    } else {
      // HTTP error - retry if attempt < 3
      const shouldRetry = delivery.attempt < 3;
      const nextStatus = shouldRetry ? DeliveryStatus.RETRYING : DeliveryStatus.FAILED;
      const nextRetryAt = shouldRetry
        ? new Date(Date.now() + getRetryDelay(delivery.attempt))
        : null;

      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: nextStatus,
          responseStatus: response.status,
          responseBody: responseBody.substring(0, 5000),
          duration,
          nextRetryAt,
        },
      });

      return {
        deliveryId: delivery.id,
        status: nextStatus,
        responseStatus: response.status,
      };
    }
  } catch (error) {
    // Network error or timeout
    const duration = Date.now() - startTime;
    const shouldRetry = delivery.attempt < 3;
    const nextStatus = shouldRetry ? DeliveryStatus.RETRYING : DeliveryStatus.FAILED;
    const nextRetryAt = shouldRetry
      ? new Date(Date.now() + getRetryDelay(delivery.attempt))
      : null;

    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: nextStatus,
        responseBody: error instanceof Error ? error.message : 'Unknown error',
        duration,
        nextRetryAt,
      },
    });

    return {
      deliveryId: delivery.id,
      status: nextStatus,
    };
  }
}
