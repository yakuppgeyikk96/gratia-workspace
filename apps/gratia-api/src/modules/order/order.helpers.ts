import crypto from "crypto";
import type {
  Address,
  OrderItem,
  OrderPricing,
} from "../../db/schema/order.schema";
import {
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
} from "../../db/schema/order.schema";
import {
  CartSnapshotItem,
  CheckoutSession,
} from "../checkout/checkout-session.types";
import type { OrderNumber } from "./order.types";

/**
 * Generates unique order number
 * Format: ORD-TIMESTAMP-RANDOM
 * Uses timestamp (milliseconds) + crypto random for guaranteed uniqueness
 * @returns Order number with type safety
 */
export const generateOrderNumber = (): OrderNumber => {
  const timestamp = Date.now(); // Milliseconds since epoch
  const randomBytes = crypto.randomBytes(6); // 12 hex characters
  const randomHex = randomBytes.toString("hex").toUpperCase();

  // Format: ORD-TIMESTAMP-RANDOM
  return `ORD-${timestamp}-${randomHex}` as OrderNumber;
};

/**
 * Converts CartSnapshotItem to OrderItem format (PostgreSQL compatible)
 * @param item - CartSnapshotItem from checkout session
 * @returns OrderItem for order schema
 */
const convertSnapshotItemToOrderItem = (item: CartSnapshotItem): OrderItem => {
  return {
    productId: item.productId, // Already number (PostgreSQL ID)
    sku: item.sku,
    quantity: item.quantity,
    price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
    ...(item.discountedPrice > 0 && {
      discountedPrice:
        typeof item.discountedPrice === "string"
          ? parseFloat(item.discountedPrice)
          : item.discountedPrice,
    }),
    productName: item.productName,
    productImages: item.productImages,
    attributes: item.attributes,
    isVariant: item.isVariant,
  };
};

/**
 * Maps checkout session to order data
 * @param session - Checkout session (assumed to be validated)
 * @param orderNumber - Generated order number
 * @param userId - User ID (optional, number for PostgreSQL)
 * @param paymentIntentId - Stripe payment intent ID (optional)
 * @returns Order data ready to be saved
 */
export const mapCheckoutSessionToOrder = (
  session: CheckoutSession,
  orderNumber: OrderNumber,
  userId: number | undefined,
  paymentIntentId?: string
): {
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
  status: OrderStatus;
  paymentStatus: PaymentStatus;
} => {
  // Convert CartSnapshotItem[] to OrderItem[]
  const orderItems = session.cartSnapshot.items.map(
    convertSnapshotItemToOrderItem
  );

  return {
    orderNumber,
    userId: userId || null,
    email: session.shippingAddress!.email!,
    items: orderItems,
    shippingAddress: session.shippingAddress!,
    billingAddress: session.billingAddress!,
    shippingMethodId: session.shippingMethodId || null,
    paymentMethodType:
      (session.paymentMethodType as PaymentMethodType) ||
      PaymentMethodType.CREDIT_CARD,
    paymentIntentId: paymentIntentId || null,
    pricing: session.pricing,
    status: OrderStatus.PENDING,
    // Always start as PENDING; Stripe webhooks will transition to PAID/FAILED/REFUNDED
    paymentStatus: PaymentStatus.PENDING,
  };
};
