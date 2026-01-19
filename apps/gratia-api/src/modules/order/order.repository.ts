import { eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type Address,
  type Order,
  type OrderItem,
  type OrderPricing,
  orders,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
} from "../../db/schema/order.schema";

/**
 * Create order in database
 */
export const createOrder = async (orderData: {
  orderNumber: string;
  userId?: number | null;
  email: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethodId?: number | null;
  paymentMethodType: PaymentMethodType | string;
  paymentIntentId?: string | null;
  pricing: OrderPricing;
  status?: OrderStatus | string;
  paymentStatus?: PaymentStatus | string;
  notes?: string | null;
}): Promise<Order | null> => {
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber: orderData.orderNumber,
      userId: orderData.userId || null,
      email: orderData.email.toLowerCase(),
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      shippingMethodId: orderData.shippingMethodId || null,
      paymentMethodType:
        (orderData.paymentMethodType as PaymentMethodType) ||
        PaymentMethodType.CREDIT_CARD,
      paymentIntentId: orderData.paymentIntentId || null,
      pricing: orderData.pricing,
      status: (orderData.status as OrderStatus) || OrderStatus.PENDING,
      paymentStatus:
        (orderData.paymentStatus as PaymentStatus) || PaymentStatus.PENDING,
      notes: orderData.notes || null,
    })
    .returning();

  return order || null;
};

/**
 * Find order by order number
 */
export const findOrderByOrderNumber = async (
  orderNumber: string
): Promise<Order | null> => {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  return order || null;
};

/**
 * Find order by ID
 */
export const findOrderById = async (id: number): Promise<Order | null> => {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  return order || null;
};

/**
 * Find orders by user ID
 */
export const findOrdersByUserId = async (userId: number): Promise<Order[]> => {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(orders.createdAt);
};

/**
 * Find orders by email (for guest orders)
 */
export const findOrdersByEmail = async (email: string): Promise<Order[]> => {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.email, email.toLowerCase()))
    .orderBy(orders.createdAt);
};

/**
 * Find order by Stripe payment intent ID
 */
export const findOrderByPaymentIntentId = async (
  paymentIntentId: string
): Promise<Order | null> => {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentIntentId, paymentIntentId))
    .limit(1);

  return order || null;
};

/**
 * Update order payment intent ID (after PaymentIntent creation)
 */
export const updateOrderPaymentIntentId = async (
  orderId: number,
  paymentIntentId: string
): Promise<Order | null> => {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      paymentIntentId,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return updatedOrder || null;
};

/**
 * Update order payment status (used by Stripe webhooks)
 */
export const updateOrderPaymentStatus = async (
  orderId: number,
  paymentStatus: PaymentStatus
): Promise<Order | null> => {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      paymentStatus,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return updatedOrder || null;
};
