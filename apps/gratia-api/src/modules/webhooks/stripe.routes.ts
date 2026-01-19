import express, { Router } from "express";
import { stripeWebhookController } from "./stripe.controller";

const router: Router = Router();

/**
 * Stripe webhooks require raw request body for signature verification.
 * This route must be mounted BEFORE express.json() middleware.
 */
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController
);

export default router;

