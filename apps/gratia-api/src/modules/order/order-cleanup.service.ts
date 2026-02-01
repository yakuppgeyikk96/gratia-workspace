import { PaymentStatus, type Order, type OrderItem } from "../../db/schema/order.schema";
import {
  getPaymentIntent,
  cancelPaymentIntent,
} from "../../shared/services";
import { releaseStockReservation } from "../cart";
import {
  findPendingOrdersOlderThan,
  updateOrderPaymentStatus,
} from "./order.repository";

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const PENDING_ORDER_TIMEOUT_MINUTES = 60; // 1 hour

/**
 * Cancellable Stripe PaymentIntent statuses
 * These statuses indicate the payment was never completed
 */
const CANCELLABLE_STATUSES = new Set([
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
  "processing",
]);

/**
 * Process a single orphan order:
 * 1. Check Stripe PaymentIntent status
 * 2. Cancel PaymentIntent if still pending
 * 3. Mark order as FAILED
 * 4. Release stock locks
 */
const processOrphanOrder = async (order: Order): Promise<void> => {
  try {
    if (order.paymentIntentId) {
      const paymentIntent = await getPaymentIntent(order.paymentIntentId);

      // If payment actually succeeded, don't clean up (webhook may be delayed)
      if (paymentIntent.status === "succeeded") {
        return;
      }

      // Cancel the PaymentIntent if it's in a cancellable state
      if (CANCELLABLE_STATUSES.has(paymentIntent.status)) {
        try {
          await cancelPaymentIntent(order.paymentIntentId);
        } catch {
          // PaymentIntent may already be cancelled or in non-cancellable state
        }
      }

      // Release stock locks using sessionToken from PaymentIntent metadata
      const sessionToken = paymentIntent.metadata?.sessionToken;
      if (sessionToken) {
        await releaseStockReservation(sessionToken);
      }
    }

    // Mark order payment as FAILED
    await updateOrderPaymentStatus(order.id, PaymentStatus.FAILED);

    console.log(
      `[order-cleanup] Marked orphan order ${order.orderNumber} as FAILED`
    );
  } catch (err) {
    console.error(
      `[order-cleanup] Failed to process orphan order ${order.orderNumber}:`,
      err
    );
  }
};

/**
 * Run cleanup cycle: find and process all orphan orders
 */
const runCleanupCycle = async (): Promise<void> => {
  try {
    const orphanOrders = await findPendingOrdersOlderThan(
      PENDING_ORDER_TIMEOUT_MINUTES
    );

    if (orphanOrders.length === 0) {
      return;
    }

    console.log(
      `[order-cleanup] Found ${orphanOrders.length} orphan order(s) to process`
    );

    for (const order of orphanOrders) {
      await processOrphanOrder(order);
    }
  } catch (err) {
    console.error("[order-cleanup] Cleanup cycle failed:", err);
  }
};

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the orphan order cleanup scheduled job
 */
export const startOrderCleanupJob = (): void => {
  if (cleanupInterval) {
    return;
  }

  console.log(
    `[order-cleanup] Starting cleanup job (interval: ${CLEANUP_INTERVAL_MS / 60000} min, timeout: ${PENDING_ORDER_TIMEOUT_MINUTES} min)`
  );

  // Run once on startup (after a short delay to let services initialize)
  setTimeout(() => {
    runCleanupCycle();
  }, 10_000);

  // Then run on interval
  cleanupInterval = setInterval(runCleanupCycle, CLEANUP_INTERVAL_MS);
};

/**
 * Stop the cleanup job (for graceful shutdown)
 */
export const stopOrderCleanupJob = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log("[order-cleanup] Cleanup job stopped");
  }
};