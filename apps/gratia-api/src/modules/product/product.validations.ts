import { z } from "zod";

// Standardized attribute enums
const productColorEnum = z.enum([
  "black",
  "white",
  "gray",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "beige",
  "navy",
  "teal",
  "burgundy",
  "olive",
  "cream",
  "tan",
  "maroon",
  "coral",
  "silver",
  "gold",
  "khaki",
  "mint",
  "lavender",
]);

const productSizeEnum = z.enum([
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "one-size",
]);

const productMaterialEnum = z.enum([
  "cotton",
  "polyester",
  "wool",
  "silk",
  "linen",
  "denim",
  "leather",
  "suede",
  "cashmere",
  "nylon",
  "spandex",
  "rayon",
  "velvet",
  "satin",
  "acrylic",
  "modal",
  "viscose",
]);

const productAttributesSchema = z.object({
  color: productColorEnum.optional(),
  size: productSizeEnum.optional(),
  material: productMaterialEnum.optional(),
});

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

  sku: z.string().min(1, "Product SKU is required").trim(),

  vendorId: z.number().int().positive().optional(),

  brandId: z.number().int().positive().optional(),

  categoryId: z.number().int().positive(),

  collectionSlugs: z
    .array(
      z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid collection slug")
    )
    .default([]),

  price: z.number().min(0, "Price cannot be negative"),

  discountedPrice: z
    .number()
    .min(0, "Discounted price cannot be negative")
    .optional(),

  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),

  attributes: productAttributesSchema.optional(),

  images: z.array(z.string().url("Please enter a valid URL")).default([]),

  productGroupId: z.string().trim().optional(),

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

export const updateProductSchema = createProductSchema.partial();

// Query validation schema for getProducts endpoint
export const getProductsQuerySchema = z.object({
  categorySlug: z.string().optional(),
  collectionSlug: z.string().optional(),
  sort: z.enum(["newest", "price-low", "price-high", "name"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  details: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  "filters[color]": z.union([z.string(), z.array(z.string())]).optional(),
  "filters[size]": z.union([z.string(), z.array(z.string())]).optional(),
  "filters[material]": z.union([z.string(), z.array(z.string())]).optional(),
  "filters[minPrice]": z.coerce.number().min(0).optional(),
  "filters[maxPrice]": z.coerce.number().min(0).optional(),
});

// Params validation schema for getProductById endpoint
export const getProductByIdParamsSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

// Query validation schema for getProductById endpoint
export const getProductByIdQuerySchema = z.object({
  details: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// Params validation schema for getProductWithVariants endpoint
export const getProductWithVariantsParamsSchema = z.object({
  slug: z
    .string()
    .min(1, "Product slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid product slug format"),
});

// Query validation schema for getFeaturedProducts endpoint
export const getFeaturedProductsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type GetProductsQueryDto = z.infer<typeof getProductsQuerySchema>;
export type GetProductByIdParamsDto = z.infer<
  typeof getProductByIdParamsSchema
>;
export type GetProductByIdQueryDto = z.infer<typeof getProductByIdQuerySchema>;
export type GetProductWithVariantsParamsDto = z.infer<
  typeof getProductWithVariantsParamsSchema
>;
export type GetFeaturedProductsQueryDto = z.infer<
  typeof getFeaturedProductsQuerySchema
>;
