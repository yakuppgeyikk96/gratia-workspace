import { z } from "zod";

export const orderNumberParamsSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required").trim(),
});

export const requestOrderAccessSchema = z.object({
  email: z.string().email("Please enter a valid email").toLowerCase().trim(),
});

export const userOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const verifyOrderAccessSchema = z.object({
  requestToken: z.string().min(1, "Request token is required").trim(),
  code: z
    .string()
    .regex(/^\d{6}$/, "Verification code must be 6 digits")
    .trim(),
});

