import { IApiResponse } from "./Api.types";
import { CartItem } from "./Cart.types";
import { Address, CheckoutPricing, PaymentMethodType } from "./Checkout.types";
import { ShippingMethod } from "./Shipping.types";

// Order Status Types
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Extends CartItem
export type OrderItem = CartItem;

// Main Order Model
export interface Order {
  _id: string;
  orderNumber: string;

  // User Information
  userId: string | null;
  guestEmail: string | null;

  // Addresses
  shippingAddress: Address;
  billingAddress: Address;

  // Shipping
  shippingMethodId: string;
  shippingMethod: ShippingMethod;

  // Payment
  paymentMethodType: PaymentMethodType;
  paymentStatus: PaymentStatus;
  paymentToken?: string; // Payment gateway token (if credit card)
  paymentGateway?: string; // e.g., "stripe", "iyzico"

  // Order Items (snapshot from cart - using CartItem)
  items: OrderItem[];
  totalItems: number;

  // Pricing (using CheckoutPricing - same structure)
  pricing: CheckoutPricing;

  // Order Status
  orderStatus: OrderStatus;

  // Notes
  notes?: string; // Customer notes

  // References
  sessionToken: string; // Reference to checkout session
  cartId: string; // Reference to original cart

  // Timestamps
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

// Response Types
export type OrderResponse = IApiResponse<Order>;
export type OrdersResponse = IApiResponse<Order[]>;

// Request DTOs (if needed for order updates)
export interface UpdateOrderStatusRequest {
  orderStatus: OrderStatus;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus;
}
