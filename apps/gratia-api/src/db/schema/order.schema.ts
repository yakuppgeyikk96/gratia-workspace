import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";

/**
 * Order status enum
 */
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

/**
 * Payment status enum
 */
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

/**
 * Payment method type enum
 */
export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
  "credit_card",
  "bank_transfer",
  "cash_on_delivery",
]);

/**
 * Order Item interface (for type safety)
 */
export interface OrderItem {
  productId: number; // PostgreSQL product ID
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
  };
  isVariant: boolean;
}

/**
 * Address interface (for type safety)
 */
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

/**
 * Pricing interface (for type safety)
 */
export interface OrderPricing {
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax?: number;
  total: number;
}

/**
 * Order table schema for PostgreSQL
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),

  orderNumber: varchar("order_number", { length: 255 }).notNull().unique(),

  // Foreign key to users table (nullable for guest orders)
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // Email for guest orders
  email: varchar("email", { length: 255 }).notNull(),

  // Order items (JSONB array)
  items: jsonb("items").$type<OrderItem[]>().notNull(),

  // Shipping address (JSONB object)
  shippingAddress: jsonb("shipping_address").$type<Address>().notNull(),

  // Billing address (JSONB object)
  billingAddress: jsonb("billing_address").$type<Address>().notNull(),

  // Shipping method ID (nullable until shipping module is migrated)
  shippingMethodId: integer("shipping_method_id"), // Will add reference when shipping schema is created

  // Payment information
  paymentMethodType: paymentMethodTypeEnum("payment_method_type").notNull(),

  paymentIntentId: varchar("payment_intent_id", { length: 255 }),

  // Pricing (JSONB object)
  pricing: jsonb("pricing").$type<OrderPricing>().notNull(),

  // Status
  status: orderStatusEnum("status").notNull().default("pending"),

  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),

  // Optional notes
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TypeScript type inference from schemas
 */
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// Re-export enums as TypeScript enums for easier usage
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  CASH_ON_DELIVERY = "cash_on_delivery",
}
