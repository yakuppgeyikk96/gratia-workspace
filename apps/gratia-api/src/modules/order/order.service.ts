import { Order } from "../../db/schema/order.schema";
import type { CheckoutSession } from "../checkout/checkout-session.types";
import { findUserIdByEmail } from "../user/user.repository";
import {
  generateOrderNumber,
  mapCheckoutSessionToOrder,
} from "./order.helpers";
import { createOrder } from "./order.repository";

export const createOrderFromSession = async (
  session: CheckoutSession,
  paymentIntentId?: string
): Promise<Order> => {
  const userId = await findUserIdByEmail(session.shippingAddress!.email!);

  // Use orderNumber from session if available, otherwise generate a new one
  const orderNumber = session.orderNumber || generateOrderNumber();

  const orderData = mapCheckoutSessionToOrder(
    session,
    orderNumber,
    userId,
    paymentIntentId
  );

  const order = await createOrder(orderData);

  if (!order) {
    throw new Error("Failed to create order");
  }

  return order;
};
