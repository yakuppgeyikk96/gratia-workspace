import { z } from "zod";

export const createProductFormSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name cannot exceed 200 characters"),

  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug cannot exceed 200 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"),

  description: z.string().optional(),

  sku: z
    .string()
    .min(1, "SKU is required")
    .max(100, "SKU cannot exceed 100 characters"),

  categoryId: z.string().min(1, "Category is required"),

  brandId: z.string().optional(),

  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal (e.g. 99.99)"),

  discountedPrice: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Discounted price must be a valid decimal (e.g. 79.99)",
    )
    .or(z.literal(""))
    .optional(),

  stock: z
    .string()
    .min(1, "Stock is required")
    .regex(/^\d+$/, "Stock must be a whole number"),

  metaTitle: z
    .string()
    .max(60, "Meta title cannot exceed 60 characters")
    .optional(),

  metaDescription: z
    .string()
    .max(160, "Meta description cannot exceed 160 characters")
    .optional(),

  isActive: z.boolean(),
});

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;
