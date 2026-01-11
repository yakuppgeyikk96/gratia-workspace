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
import { brands } from "./brand.schema";
import { categories } from "./category.schema";
import { vendors } from "./vendor.schema";

/**
 * Product table schema for PostgreSQL
 * ProductAttributes interface for type safety
 */
export interface ProductAttributes {
  color?:
    | "black"
    | "white"
    | "gray"
    | "red"
    | "blue"
    | "green"
    | "yellow"
    | "orange"
    | "purple"
    | "pink"
    | "brown"
    | "beige"
    | "navy"
    | "teal"
    | "burgundy"
    | "olive"
    | "cream"
    | "tan"
    | "maroon"
    | "coral"
    | "silver"
    | "gold"
    | "khaki"
    | "mint"
    | "lavender";
  size?: "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL" | "one-size";
  material?:
    | "cotton"
    | "polyester"
    | "wool"
    | "silk"
    | "linen"
    | "denim"
    | "leather"
    | "suede"
    | "cashmere"
    | "nylon"
    | "spandex"
    | "rayon"
    | "velvet"
    | "satin"
    | "acrylic"
    | "modal"
    | "viscose";
}

export const products = pgTable("products", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),

  sku: varchar("sku", { length: 100 }).notNull().unique(),

  // Foreign keys
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),

  brandId: integer("brand_id").references(() => brands.id, {
    onDelete: "set null",
  }),

  vendorId: integer("vendor_id").references(() => vendors.id, {
    onDelete: "set null",
  }),

  categoryPath: text("category_path"),
  collectionSlugs: jsonb("collection_slugs").$type<string[]>().default([]),

  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),

  stock: integer("stock").notNull().default(0),

  attributes: jsonb("attributes")
    .$type<ProductAttributes>()
    .notNull()
    .default({}),

  images: jsonb("images").$type<string[]>().notNull().default([]),

  productGroupId: varchar("product_group_id", { length: 255 }).notNull(),

  metaTitle: varchar("meta_title", { length: 60 }),
  metaDescription: varchar("meta_description", { length: 160 }),

  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  featuredOrder: integer("featured_order").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Base Product type from schema
export type ProductBase = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// Extended Product type with optional populated relations
import { Brand } from "./brand.schema";
import { Category } from "./category.schema";
import { Vendor } from "./vendor.schema";

export type Product = ProductBase & {
  category?: Category | null;
  brand?: Brand | null;
  vendor?: Vendor | null;
};
