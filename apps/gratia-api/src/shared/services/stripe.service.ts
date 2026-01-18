import Stripe from "stripe";
import { AppError, ErrorCode } from "../errors/base.errors";

// Stripe secret key from environment
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
});

/**
 * Constructs and verifies a Stripe webhook event.
 * Requires raw request body (Buffer) and Stripe-Signature header.
 */
export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new AppError(
      "STRIPE_WEBHOOK_SECRET is not set in environment variables",
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error: any) {
    throw new AppError(
      error.message || "Webhook signature verification failed",
      ErrorCode.BAD_REQUEST
    );
  }
};

/**
 * Creates a payment intent for checkout
 * @param amount - Amount in the currency's smallest unit (e.g., cents for USD)
 * @param currency - Currency code (default: 'usd')
 * @param metadata - Additional metadata to attach to the payment intent
 * @returns Payment intent object
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = "usd",
  metadata?: Record<string, string>,
  idempotencyKey?: string
): Promise<Stripe.PaymentIntent> => {
  try {
    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    const params: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    };

    const requestOptions: Stripe.RequestOptions | undefined = idempotencyKey
      ? { idempotencyKey }
      : undefined;

    const paymentIntent = await stripe.paymentIntents.create(
      params,
      requestOptions
    );

    return paymentIntent;
  } catch (error: any) {
    throw new AppError(
      error.message || "Payment processing failed",
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Confirms a payment intent with payment method
 * @param paymentIntentId - Payment intent ID
 * @param paymentMethodId - Payment method ID from frontend (Stripe Elements)
 * @returns Confirmed payment intent
 */
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    // Check if payment succeeded
    if (paymentIntent.status !== "succeeded") {
      throw new AppError("Payment confirmation failed", ErrorCode.BAD_REQUEST);
    }

    return paymentIntent;
  } catch (error: any) {
    // If it's already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }

    // Handle Stripe-specific errors
    if (error.type === "StripeCardError") {
      throw new AppError(
        error.message || "Card payment failed",
        ErrorCode.BAD_REQUEST
      );
    }

    throw new AppError(
      error.message || "Payment confirmation failed",
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Retrieves a payment intent by ID
 * @param paymentIntentId - Payment intent ID
 * @returns Payment intent object
 */
export const getPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error: any) {
    throw new AppError(
      error.message || "Payment intent not found",
      ErrorCode.NOT_FOUND
    );
  }
};

/**
 * Cancels a payment intent
 * @param paymentIntentId - Payment intent ID
 * @returns Cancelled payment intent
 */
export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (error: any) {
    throw new AppError(
      error.message || "Failed to cancel payment intent",
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
};
