import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Collection type enum
 */
export const collectionTypeEnum = pgEnum("collection_type", [
  "new",
  "trending",
  "sale",
  "featured",
]);

/**
 * Collection table schema for PostgreSQL
 */
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  slug: varchar("slug", { length: 100 }).notNull().unique(),

  description: text("description"),

  collectionType: collectionTypeEnum("collection_type").notNull(),

  isActive: boolean("is_active").notNull().default(true),

  sortOrder: integer("sort_order").notNull().default(0),

  imageUrl: varchar("image_url", { length: 500 }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TypeScript type inference from schema
 */
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

// Re-export enum as TypeScript enum for easier usage
export enum CollectionType {
  NEW = "new",
  TRENDING = "trending",
  SALE = "sale",
  FEATURED = "featured",
}
