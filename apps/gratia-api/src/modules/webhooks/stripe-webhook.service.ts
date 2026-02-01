import type Stripe from "stripe";
import { PaymentStatus, type OrderItem } from "../../db/schema/order.schema";
import { sendMail } from "../../shared/services";
import { commitStockReservation, releaseStockReservation } from "../cart";
import {
  findOrderByPaymentIntentId,
  updateOrderPaymentStatus,
} from "../order/order.repository";

const getPaymentIntentIdFromEvent = (event: Stripe.Event): string | null => {
  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled"
  ) {
    const pi = event.data.object as Stripe.PaymentIntent;
    return pi.id;
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const pi = charge.payment_intent;
    return typeof pi === "string" ? pi : pi?.id || null;
  }

  return null;
};

const getSessionTokenFromEvent = (event: Stripe.Event): string => {
  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled"
  ) {
    const pi = event.data.object as Stripe.PaymentIntent;
    return pi.metadata?.sessionToken || "";
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const pi = charge.payment_intent;
    if (typeof pi === "object" && pi?.metadata) {
      return pi.metadata.sessionToken || "";
    }
  }

  return "";
};

export const handleStripeWebhookEvent = async (
  event: Stripe.Event,
): Promise<void> => {
  const paymentIntentId = getPaymentIntentIdFromEvent(event);

  if (!paymentIntentId) {
    // Ignore unrelated events for now
    return;
  }

  const order = await findOrderByPaymentIntentId(paymentIntentId);

  if (!order) {
    // Order might not exist (or may belong to another environment)
    console.warn(
      "[stripe-webhook] Order not found for paymentIntentId:",
      paymentIntentId,
      "event:",
      event.id,
      event.type,
    );
    return;
  }

  let nextStatus: PaymentStatus | null = null;

  switch (event.type) {
    case "payment_intent.succeeded":
      nextStatus = PaymentStatus.PAID;
      break;
    case "payment_intent.payment_failed":
      nextStatus = PaymentStatus.FAILED;
      break;
    case "charge.refunded":
      nextStatus = PaymentStatus.REFUNDED;
      break;
    default:
      nextStatus = null;
  }

  if (!nextStatus) {
    return;
  }

  // Idempotency: Stripe may retry the same event
  if (order.paymentStatus === nextStatus) {
    return;
  }

  await updateOrderPaymentStatus(order.id, nextStatus);

  // Handle stock based on payment outcome
  if (nextStatus === PaymentStatus.PAID) {
    // Commit stock reservation: decrease DB stock and release Redis locks
    const sessionToken = getSessionTokenFromEvent(event);
    const orderItems = order.items as OrderItem[];
    const stockItems = orderItems.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
    }));

    try {
      await commitStockReservation(sessionToken, stockItems);
    } catch (err) {
      console.error(
        "[stripe-webhook] Failed to commit stock reservation for order:",
        order.orderNumber,
        err,
      );
    }
  } else if (nextStatus === PaymentStatus.FAILED) {
    // Release stock locks so other customers can purchase
    const sessionToken = getSessionTokenFromEvent(event);
    try {
      await releaseStockReservation(sessionToken);
    } catch (err) {
      console.error(
        "[stripe-webhook] Failed to release stock reservation for order:",
        order.orderNumber,
        err,
      );
    }
  }

  // Send confirmation email once payment is marked as PAID
  if (nextStatus === PaymentStatus.PAID) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const orderUrl = `${frontendUrl}/orders/${order.orderNumber}`;

    await sendMail({
      to: order.email,
      subject: `Payment received for order ${order.orderNumber}`,
      text: `Your payment was received.\n\nYou can view your order here: ${orderUrl}\n\nIf you cannot access the page, you can request an access code using your email address.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment received</h2>
          <p>We received your payment for order <strong>${order.orderNumber}</strong>.</p>
          <p>
            View your order:
            <a href="${orderUrl}">${orderUrl}</a>
          </p>
          <p style="color:#666; font-size: 14px;">
            If you cannot access the page, you can request an access code using your email address.
          </p>
        </div>
      `,
    });
  }
};
