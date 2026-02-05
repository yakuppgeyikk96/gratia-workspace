import { IApiResponse } from "./Api.types";
import { Address, CheckoutPricing, PaymentMethodType } from "./Checkout.types";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: number;
  sku: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
  productName: string;
  productImages: string[];
  attributes: {
    color?: string;
    size?: string;
    material?: string;
    [key: string]: unknown;
  };
  isVariant: boolean;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  email: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethodId: number | null;
  paymentMethodType: PaymentMethodType;
  paymentIntentId: string | null;
  pricing: CheckoutPricing;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderResponse = IApiResponse<Order | null>;

export interface RequestOrderAccessRequest {
  email: string;
}

export interface RequestOrderAccessResponse {
  requestToken: string;
}

export type RequestOrderAccessResponseType = IApiResponse<RequestOrderAccessResponse>;

export interface VerifyOrderAccessRequest {
  requestToken: string;
  code: string;
}

export interface VerifyOrderAccessResponse {
  orderAccessToken: string;
}

export type VerifyOrderAccessResponseType = IApiResponse<VerifyOrderAccessResponse>;

export interface PaginatedOrders {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type PaginatedOrdersResponse = IApiResponse<PaginatedOrders>;
