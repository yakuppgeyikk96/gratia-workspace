import { eq, sql } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  webhookEvents,
  type WebhookEvent,
} from "../../db/schema/webhook-event.schema";

interface IncomingWebhookEvent {
  eventId: string;
  provider?: string;
  type: string;
  payload: unknown;
}

/**
 * Upsert an incoming webhook delivery, keyed by provider event id.
 *
 * - New event → insert as pending, attemptCount = 1.
 * - Existing failed event → bump attemptCount, reset to pending so the
 *   caller will reprocess it. This is what makes Stripe's 7-attempt
 *   schedule actually do something for us.
 * - Existing processed event → leave it alone (sticky); caller will see
 *   the "processed" status and short-circuit.
 */
export const upsertIncomingWebhookEvent = async (
  data: IncomingWebhookEvent
): Promise<WebhookEvent> => {
  const [row] = await db
    .insert(webhookEvents)
    .values({
      eventId: data.eventId,
      provider: data.provider ?? "stripe",
      type: data.type,
      payload: data.payload as unknown as object,
    })
    .onConflictDoUpdate({
      target: webhookEvents.eventId,
      set: {
        attemptCount: sql`${webhookEvents.attemptCount} + 1`,
        status: sql`CASE WHEN ${webhookEvents.status} = 'failed' THEN 'pending'::webhook_event_status ELSE ${webhookEvents.status} END`,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!row) {
    throw new Error("Failed to upsert webhook event audit row");
  }

  return row;
};

export const markWebhookEventProcessed = async (
  eventId: string
): Promise<void> => {
  await db
    .update(webhookEvents)
    .set({
      status: "processed",
      processedAt: new Date(),
      updatedAt: new Date(),
      errorMessage: null,
    })
    .where(eq(webhookEvents.eventId, eventId));
};

export const markWebhookEventFailed = async (
  eventId: string,
  errorMessage: string
): Promise<void> => {
  await db
    .update(webhookEvents)
    .set({
      status: "failed",
      errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(webhookEvents.eventId, eventId));
};
