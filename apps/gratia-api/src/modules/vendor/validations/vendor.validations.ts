import { z } from "zod";

export const createVendorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),

  storeName: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name cannot exceed 100 characters")
    .trim(),

  storeSlug: z
    .string()
    .min(1, "Store slug is required")
    .max(100, "Store slug cannot exceed 100 characters")
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"),

  storeDescription: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),

  email: z.string().email("Please enter a valid email").toLowerCase().trim(),

  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number").optional(),

  logo: z.string().trim().optional(),

  banner: z.string().trim().optional(),

  isActive: z.boolean().default(true),
});

export const updateVendorSchema = createVendorSchema.partial().omit({ userId: true });

export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type UpdateVendorDto = z.infer<typeof updateVendorSchema>;