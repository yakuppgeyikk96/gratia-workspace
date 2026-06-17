import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const webhookEventStatusEnum = pgEnum("webhook_event_status", [
  "pending",
  "processed",
  "failed",
]);

/**
 * Persistent audit + idempotency log for inbound webhook deliveries.
 *
 * The unique constraint on event_id makes the receive step idempotent at
 * the DB level: Stripe retries land on the same row instead of creating
 * duplicates, and a "processed" row tells us we can shortcut the response.
 */
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: serial("id").primaryKey(),
    eventId: varchar("event_id", { length: 255 }).notNull().unique(),
    provider: varchar("provider", { length: 50 }).notNull().default("stripe"),
    type: varchar("type", { length: 100 }).notNull(),
    payload: jsonb("payload").notNull(),
    status: webhookEventStatusEnum("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    attemptCount: integer("attempt_count").notNull().default(1),
    receivedAt: timestamp("received_at").notNull().defaultNow(),
    processedAt: timestamp("processed_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    statusReceivedAtIdx: index("webhook_events_status_received_at_idx").on(
      t.status,
      t.receivedAt
    ),
    typeReceivedAtIdx: index("webhook_events_type_received_at_idx").on(
      t.type,
      t.receivedAt
    ),
  })
);

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
