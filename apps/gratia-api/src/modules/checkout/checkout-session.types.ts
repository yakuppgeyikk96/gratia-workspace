import type { ShippingMethod as ShippingMethodSchema } from "../../db/schema/shipping.schema";
import { Address } from "../../shared/types";
import { OrderNumber } from "../order/order.types";

export type ShippingMethod = ShippingMethodSchema;

export interface CheckoutPricing {
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax?: number;
  total: number;
}

// Enums
export enum CheckoutStep {
  SHIPPING = "shipping",
  SHIPPING_METHOD = "shipping_method",
  PAYMENT = "payment",
  COMPLETED = "completed",
}

export enum CheckoutStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  EXPIRED = "expired",
  ABANDONED = "abandoned",
}

export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  CASH_ON_DELIVERY = "cash_on_delivery",
}

export interface CartSnapshotItem {
  productId: number;
  sku: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  productName: string;
  productImages: string[];
  attributes: {
    color?: string;
    size?: string;
    material?: string;
  };
  isVariant: boolean;
}

// Cart Snapshot
export interface CartSnapshot {
  items: CartSnapshotItem[];
  subtotal: number;
  totalItems: number;
}

// Checkout Session
export interface CheckoutSession {
  sessionToken: string;
  currentStep: CheckoutStep;
  status: CheckoutStatus;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingMethodId: string | null; // Stored as string in Redis, will be parsed to number when creating order
  paymentMethodType: PaymentMethodType | null;
  cartSnapshot: CartSnapshot;
  pricing: CheckoutPricing;
  expiresAt: Date;
  completedAt: Date | null;
  orderNumber: OrderNumber | null;
  createdAt: Date;
  updatedAt: Date;
  ttl: number;
}

// Request DTOs
export interface CreateCheckoutSessionDto {
  items: {
    sku: string;
    quantity: number;
  }[];
}

export interface UpdateShippingAddressDto {
  shippingAddress: Address;
  billingAddress?: Address;
  billingIsSameAsShipping: boolean;
}

export interface SelectShippingMethodDto {
  shippingMethodId: number;
}

export interface CompletePaymentDto {
  paymentMethodType: PaymentMethodType;
  paymentToken: string;
  notes?: string;
}

// Response DTOs
export interface CreateCheckoutSessionResponse {
  sessionToken: string;
  expiresAt: Date;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
}

export interface CheckoutSessionWithMeta {
  session: CheckoutSession;
  isGuest: boolean;
  canResume: boolean;
  availableShippingMethods?: ShippingMethod[];
}
