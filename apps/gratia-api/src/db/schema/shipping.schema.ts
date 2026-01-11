import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Shipping Method table schema for PostgreSQL
 */
export const shippingMethods = pgTable("shipping_methods", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  carrier: varchar("carrier", { length: 50 }).notNull(),

  description: text("description"),

  estimatedDays: varchar("estimated_days", { length: 50 }).notNull(),

  price: decimal("price", { precision: 10, scale: 2 }).notNull(),

  isFree: boolean("is_free").notNull().default(false),

  isActive: boolean("is_active").notNull().default(true),

  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),

  // Available countries as JSONB array
  availableCountries: jsonb("available_countries").$type<string[]>().default([]),

  imageUrl: varchar("image_url", { length: 500 }),

  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TypeScript type inference from schema
 */
export type ShippingMethod = typeof shippingMethods.$inferSelect;
export type NewShippingMethod = typeof shippingMethods.$inferInsert;
