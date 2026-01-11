import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Country table schema for PostgreSQL
 */
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),

  code: varchar("code", { length: 2 }).notNull().unique(),

  name: varchar("name", { length: 100 }).notNull(),

  isAvailableForShipping: boolean("is_available_for_shipping")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * State table schema for PostgreSQL
 */
export const states = pgTable("states", {
  id: serial("id").primaryKey(),

  // Foreign key to countries table
  countryId: integer("country_id")
    .notNull()
    .references(() => countries.id, { onDelete: "cascade" }),

  code: varchar("code", { length: 10 }).notNull(),

  name: varchar("name", { length: 100 }).notNull(),

  isAvailableForShipping: boolean("is_available_for_shipping")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * City table schema for PostgreSQL
 */
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),

  // Foreign key to states table
  stateId: integer("state_id")
    .notNull()
    .references(() => states.id, { onDelete: "cascade" }),

  code: varchar("code", { length: 20 }).notNull(),

  name: varchar("name", { length: 100 }).notNull(),

  isAvailableForShipping: boolean("is_available_for_shipping")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TypeScript type inference from schemas
 */
export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;

export type State = typeof states.$inferSelect;
export type NewState = typeof states.$inferInsert;

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
