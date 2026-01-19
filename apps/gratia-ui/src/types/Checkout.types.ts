import { IApiResponse } from "./Api.types";
import { CartItem } from "./Cart.types";
import { ShippingMethod } from "./Shipping.types";

export type CheckoutStep =
  | "shipping"
  | "shipping_method"
  | "payment"
  | "completed";
export type CheckoutStatus = "active" | "completed" | "expired" | "abandoned";
export type PaymentMethodType =
  | "credit_card"
  | "bank_transfer"
  | "cash_on_delivery";

export interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutPricing {
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax?: number;
  total: number;
}

export interface CartSnapshot {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export interface CheckoutSession {
  sessionToken: string;
  userId: string | null;
  guestEmail: string | null;
  cartId: string;
  currentStep: CheckoutStep;
  status: CheckoutStatus;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingMethodId: number | null;
  paymentMethodType: PaymentMethodType | null;
  cartSnapshot: CartSnapshot;
  pricing: CheckoutPricing;
  expiresAt: string;
  completedAt: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  ttl: number;
}

// Request DTOs
export interface CreateCheckoutSessionRequest {
  items: {
    sku: string;
    quantity: number;
  }[];
}

export interface CreateCheckoutSessionResponse {
  sessionToken: string;
  expiresAt: string;
}

export interface UpdateShippingAddressRequest {
  shippingAddress: Address;
  billingAddress?: Address;
  billingIsSameAsShipping: boolean;
}

export interface SelectShippingMethodRequest {
  shippingMethodId: number;
}

export interface CompleteCheckoutRequest {
  paymentMethodType: PaymentMethodType;
  paymentToken?: string;
  notes?: string;
}

export interface CompleteCheckoutResponse {
  orderId: string;
  orderNumber: string;
  paymentIntentClientSecret: string;
  orderAccessToken: string;
}

// Response Types
export type CheckoutSessionResponse = IApiResponse<CheckoutSession>;
export type CreateSessionResponse = IApiResponse<CreateCheckoutSessionResponse>;
export type CompleteCheckoutResponseType =
  IApiResponse<CompleteCheckoutResponse>;

// For GET session response with metadata
export interface CheckoutSessionWithMeta {
  session: CheckoutSession;
  isGuest: boolean;
  canResume: boolean;
  availableShippingMethods?: ShippingMethod[];
}

export type CheckoutSessionWithMetaResponse =
  IApiResponse<CheckoutSessionWithMeta>;
