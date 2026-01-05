import { z } from "zod";
import { createUserSchema } from "../user/user.validation";

/**
 * Auth Validation Schemas
 * All types are inferred from Zod schemas (no separate interface files needed)
 */

// Send verification code schema (same as createUserSchema from user module)
export const sendVerificationCodeByEmailSchema = createUserSchema;

// Register user schema (verify email with token and code)
export const registerUserSchema = z.object({
  token: z.string().min(1, "Token is required"),
  code: z.string().min(1, "Code is required"),
});

// Login user schema
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Result schemas (for responses)
 */
export const sendVerificationCodeByEmailResultSchema = z.object({
  token: z.string(),
});

export const registerUserResultSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  token: z.string(), // JWT token
});

export const loginUserResultSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  token: z.string(), // JWT token
});

/**
 * TypeScript types inferred from Zod schemas
 * These replace the interface files in auth/types/
 */
export type SendVerificationCodeByEmailDto = z.infer<typeof sendVerificationCodeByEmailSchema>;
export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;

export type SendVerificationCodeByEmailResult = z.infer<typeof sendVerificationCodeByEmailResultSchema>;
export type RegisterUserResult = z.infer<typeof registerUserResultSchema>;
export type LoginUserResult = z.infer<typeof loginUserResultSchema>;