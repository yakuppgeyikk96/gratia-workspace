import { EMAIL_REGEX } from "@/constants";
import { z } from "zod";

const STORE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

export const vendorSchema = z.object({
  storeName: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name must be less than 100 characters"),

  storeSlug: z
    .string()
    .min(1, "Store slug is required")
    .max(100, "Store slug must be less than 100 characters")
    .regex(
      STORE_SLUG_REGEX,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),

  email: z
    .string()
    .min(1, "Email is required")
    .regex(EMAIL_REGEX, "Please enter a valid email address"),

  storeDescription: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .regex(E164_PHONE_REGEX, "Phone must be in E.164 format (e.g. +1234567890)")
    .optional()
    .or(z.literal("")),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
