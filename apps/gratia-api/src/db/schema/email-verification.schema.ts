import { boolean, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * EmailVerification table schema for PostgreSQL
 * Equivalent to Mongoose EmailVerification model in shared/models/email-verification.model.ts
 *
 * Used for temporary storage of email verification data during user registration
 */
export const emailVerifications = pgTable("email_verifications", {
  // Primary key
  id: serial("id").primaryKey(),

  // Verification code (6 digits sent to email)
  verificationCode: varchar("verification_code", { length: 6 }).notNull(),

  // Unique token for identifying verification request
  token: varchar("token", { length: 255 }).notNull().unique(),

  // Encrypted user data (JSON string with email, firstName, lastName, password)
  encryptedUserData: text("encrypted_user_data").notNull(),

  // Expiration timestamp
  expiresAt: timestamp("expires_at").notNull(),

  // Whether the verification code has been used
  isUsed: boolean("is_used").notNull().default(false),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * TypeScript type inference from schema
 * Usage:
 *   - EmailVerification: Complete object (from SELECT)
 *   - NewEmailVerification: Object for INSERT (without id, timestamps)
 */
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type NewEmailVerification = typeof emailVerifications.$inferInsert;