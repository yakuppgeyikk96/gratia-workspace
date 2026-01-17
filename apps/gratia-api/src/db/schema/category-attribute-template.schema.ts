import {
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { categories } from "./category.schema";

/**
 * Attribute Definition - Definition of an attribute
 */
export interface AttributeDefinition {
  key: string; // "cpu", "ram", "color", "size" - unique identifier
  type: "string" | "number" | "boolean" | "enum";
  label: string; // "CPU", "RAM", "Color" - visible name
  required: boolean; // Is required?
  enumValues?: string[]; // Values for enum type
  unit?: string; // "GB", "inch", "kg" - unit
  min?: number; // Minimum value for number type
  max?: number; // Maximum value for number type
  defaultValue?: string | number | boolean; // Default value
  sortOrder: number; // Sort order in admin panel
}

/**
 * Category Attribute Template - Attribute template for each category
 * Each category can have a template (1:1 relationship)
 */
export const categoryAttributeTemplates = pgTable(
  "category_attribute_templates",
  {
    id: serial("id").primaryKey(),

    categoryId: integer("category_id")
      .notNull()
      .unique() // Each category can have only one template
      .references(() => categories.id, { onDelete: "cascade" }),

    // Attribute definitions for this category
    attributeDefinitions: jsonb("attribute_definitions")
      .$type<AttributeDefinition[]>()
      .notNull()
      .default([]),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

export type CategoryAttributeTemplate =
  typeof categoryAttributeTemplates.$inferSelect;
export type NewCategoryAttributeTemplate =
  typeof categoryAttributeTemplates.$inferInsert;
