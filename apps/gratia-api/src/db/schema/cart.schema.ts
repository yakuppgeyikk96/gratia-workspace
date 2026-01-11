import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./product.schema";
import { users } from "./user.schema";

/**
 * Cart table schema for PostgreSQL
 * Equivalent to Mongoose Cart model in shared/models/cart.model.ts
 */
export const carts = pgTable("carts", {
  // Primary key
  id: serial("id").primaryKey(),

  // Foreign key to users table
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // Calculated fields (updated by application logic)
  totalItems: integer("total_items").notNull().default(0),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * CartItem table schema for PostgreSQL
 * Equivalent to CartItem embedded schema in Mongoose
 */
export const cartItems = pgTable("cart_items", {
  // Primary key
  id: serial("id").primaryKey(),

  // Foreign key to carts table
  cartId: integer("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),

  // Product information
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 100 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productImages: jsonb("product_images")
    .$type<string[]>()
    .notNull()
    .default([]),

  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),

  // Quantity
  quantity: integer("quantity").notNull().default(1),

  // Product attributes (color, size, material)
  attributes: jsonb("attributes")
    .$type<{
      color?: string;
      size?: string;
      material?: string;
    }>()
    .notNull()
    .default({}),

  // Variant flag
  isVariant: boolean("is_variant").notNull().default(false),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TypeScript type inference from schemas
 */
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
