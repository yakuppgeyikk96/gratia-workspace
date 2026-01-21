import { z } from "zod";
import { CART_LIMITS } from "./cart.constants";

// ============================================================================
// Cart Validation Schemas
// ============================================================================

/**
 * SKU validation
 */
export const skuSchema = z
  .string()
  .min(1, "SKU is required")
  .max(100, "SKU must be at most 100 characters");

/**
 * Quantity validation
 */
export const quantitySchema = z
  .number()
  .int("Quantity must be an integer")
  .min(1, "Quantity must be at least 1")
  .max(
    CART_LIMITS.MAX_QUANTITY_PER_ITEM,
    `Quantity cannot exceed ${CART_LIMITS.MAX_QUANTITY_PER_ITEM}`
  );

/**
 * Add to cart request validation
 */
export const addToCartSchema = z.object({
  sku: skuSchema,
  quantity: quantitySchema.default(1),
});

/**
 * Update cart item request validation
 */
export const updateCartItemSchema = z.object({
  quantity: quantitySchema,
});

/**
 * Merge cart request validation
 */
export const mergeCartSchema = z.object({
  sessionId: z
    .string()
    .min(1, "Session ID is required")
    .uuid("Invalid session ID format"),
});

/**
 * Session ID validation (from cookie or header)
 */
export const sessionIdSchema = z
  .string()
  .uuid("Invalid session ID format")
  .optional();

/**
 * SKU param validation
 */
export const skuParamSchema = z.object({
  sku: skuSchema,
});

// ============================================================================
// Type exports from schemas
// ============================================================================

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;