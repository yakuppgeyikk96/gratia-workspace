import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";

/**
 * Vendor Stats interface (for type safety)
 */
export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  rating: number;
  totalReviews: number;
}

/**
 * Vendor table schema for PostgreSQL
 */
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),

  // Foreign key to users table
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  storeName: varchar("store_name", { length: 100 }).notNull(),

  storeSlug: varchar("store_slug", { length: 100 }).notNull().unique(),

  storeDescription: text("store_description"),

  email: varchar("email", { length: 255 }).notNull(),

  phone: varchar("phone", { length: 20 }),

  logo: varchar("logo", { length: 500 }),

  banner: varchar("banner", { length: 500 }),

  // Stats as JSONB
  stats: jsonb("stats")
    .$type<VendorStats>()
    .notNull()
    .default({
      totalProducts: 0,
      totalOrders: 0,
      rating: 0,
      totalReviews: 0,
    }),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TypeScript type inference from schema
 */
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
