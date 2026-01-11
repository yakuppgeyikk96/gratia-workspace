import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .max(100, "Brand name cannot exceed 100 characters")
    .trim(),

  slug: z
    .string()
    .min(1, "Brand slug is required")
    .max(100, "Brand slug cannot exceed 100 characters")
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),

  logo: z.string().trim().optional(),

  isActive: z.boolean().default(true),
});

export const updateBrandSchema = createBrandSchema.partial();

// Type exports from Zod schemas
export type CreateBrandDto = z.infer<typeof createBrandSchema>;
export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
