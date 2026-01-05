import { boolean, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * User table schema for PostgreSQL
 * Equivalent to Mongoose User model in shared/models/user.model.ts
 */
export const users = pgTable("users", {
  // Primary key
  id: serial("id").primaryKey(),

  // Required fields
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(), // Hashed password (no length limit)

  // Optional fields
  phone: varchar("phone", { length: 20 }), // E.164 format supports up to 15 digits + prefix

  // Boolean flags with defaults
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),

  // Timestamps (automatically managed)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TypeScript type inference from schema
 * Usage:
 *   - User: Complete user object (from SELECT)
 *   - NewUser: User object for INSERT (without id, timestamps)
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
