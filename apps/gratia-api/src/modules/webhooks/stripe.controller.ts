import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { constructWebhookEvent } from "../../shared/services";
import { handleStripeWebhookEvent } from "./stripe-webhook.service";

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

    await handleStripeWebhookEvent(event);

    // Stripe expects a 2xx response quickly
    return res.status(200).json({ received: true });
  }
);

