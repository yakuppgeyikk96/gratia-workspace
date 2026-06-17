import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { constructWebhookEvent } from "../../shared/services";
import { handleStripeWebhookEvent } from "./stripe-webhook.service";
import {
  markWebhookEventFailed,
  markWebhookEventProcessed,
  upsertIncomingWebhookEvent,
} from "./webhook-event.repository";

export const stripeWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    const signatureHeader =
      typeof signature === "string" ? signature : signature?.[0];

    if (!signatureHeader) {
      return res.status(400).send("Missing Stripe-Signature header");
    }

    // With express.raw, req.body is a Buffer
    const payload = req.body as Buffer;

    const event = constructWebhookEvent(payload, signatureHeader);

    // Audit the receipt before doing any work. Duplicate Stripe retries
    // land on the same row via the eventId unique constraint, which gives
    // us idempotency for free.
    const auditRow = await upsertIncomingWebhookEvent({
      eventId: event.id,
      provider: "stripe",
      type: event.type,
      payload: event,
    });

    // Already handled successfully on a previous delivery — acknowledge
    // immediately so Stripe stops retrying.
    if (auditRow.status === "processed") {
      return res
        .status(200)
        .json({ received: true, deduplicated: true });
    }

    try {
      await handleStripeWebhookEvent(event);
      await markWebhookEventProcessed(event.id);
      return res.status(200).json({ received: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        "[stripe-webhook] Handler failed for event:",
        event.id,
        event.type,
        message
      );
      await markWebhookEventFailed(event.id, message);
      // Surface a 5xx so Stripe retries on its own schedule. Without this,
      // a transient downstream failure (DB blip, Redis hiccup) would be
      // silently dropped.
      return res
        .status(500)
        .json({ received: false, error: "Webhook handler failed" });
    }
  }
);
