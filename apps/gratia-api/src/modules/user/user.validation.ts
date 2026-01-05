import { z } from "zod";

/**
 * User Validation Schemas
 * These schemas match the Drizzle PostgreSQL schema in db/schema/user.schema.ts
 */

// Base user schema (matching database schema)
export const userSchema = z.object({
  id: z.number().int().positive(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email")
    .min(1, "Email is required")
    .max(255, "Email cannot exceed 255 characters")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating a new user (without id and timestamps)
export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email")
    .min(1, "Email is required")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional(),
});

// Schema for updating user (all fields optional)
export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .trim()
    .optional(),
  phone: z
    .string()
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
