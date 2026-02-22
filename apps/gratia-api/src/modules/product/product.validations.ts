import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name cannot exceed 200 characters")
    .trim(),

  slug: z
    .string()
    .min(1, "Product slug is required")
    .max(200, "Product slug cannot exceed 200 characters")
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"),

  description: z.string().trim().optional(),

  sku: z
    .string()
    .min(1, "SKU is required")
    .max(100, "SKU cannot exceed 100 characters")
    .trim(),

  categoryId: z
    .number()
    .int("Category ID must be an integer")
    .positive("Category ID must be positive"),

  brandId: z
    .number()
    .int("Brand ID must be an integer")
    .positive("Brand ID must be positive")
    .optional(),

  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal (e.g. 99.99)"),

  discountedPrice: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Discounted price must be a valid decimal (e.g. 79.99)",
    )
    .optional(),

  stock: z.number().int("Stock must be an integer").min(0).default(0),

  attributes: z.record(z.string(), z.unknown()).default({}),

  productGroupId: z
    .string()
    .max(255, "Product group ID cannot exceed 255 characters")
    .trim()
    .optional(),

  metaTitle: z
    .string()
    .max(60, "Meta title cannot exceed 60 characters")
    .trim()
    .optional(),

  metaDescription: z
    .string()
    .max(160, "Meta description cannot exceed 160 characters")
    .trim()
    .optional(),

  isActive: z.boolean().default(true),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
