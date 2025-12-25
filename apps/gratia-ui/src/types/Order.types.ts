import { IApiResponse } from "./Api.types";
import { CartItem } from "./Cart.types";
import { Address, CheckoutPricing, PaymentMethodType } from "./Checkout.types";
import { ShippingMethod } from "./Shipping.types";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderItem = CartItem;

export interface Order {
  _id: string;
  orderNumber: string;

  userId: string | null;
  guestEmail: string | null;

  shippingAddress: Address;
  billingAddress: Address;

  shippingMethodId: string;
  shippingMethod: ShippingMethod;

  paymentMethodType: PaymentMethodType;
  paymentStatus: PaymentStatus;
  paymentToken?: string;
  paymentGateway?: string;

  items: OrderItem[];
  totalItems: number;

  pricing: CheckoutPricing;

  orderStatus: OrderStatus;
  notes?: string;
  sessionToken: string;
  cartId: string;

  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export type OrderResponse = IApiResponse<Order>;
export type OrdersResponse = IApiResponse<Order[]>;

export interface UpdateOrderStatusRequest {
  orderStatus: OrderStatus;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus;
}
