import { Order } from "../../db/schema/order.schema";
import type { CheckoutSession } from "../checkout/checkout-session.types";
import {
  generateOrderNumber,
  mapCheckoutSessionToOrder,
} from "./order.helpers";
import { createOrder } from "./order.repository";

export const createOrderFromSession = async (
  session: CheckoutSession,
  opts?: {
    userId?: number | null;
    paymentIntentId?: string;
    notes?: string | null;
  }
): Promise<Order> => {
  const userId = opts?.userId ?? null;

  // Use orderNumber from session if available, otherwise generate a new one
  const orderNumber = session.orderNumber || generateOrderNumber();

  const orderData = mapCheckoutSessionToOrder(
    session,
    orderNumber,
    userId === null ? undefined : userId,
    opts?.paymentIntentId
  );

  const order = await createOrder({
    ...orderData,
    notes: opts?.notes ?? null,
  });

  if (!order) {
    throw new Error("Failed to create order");
  }

  return order;
};
