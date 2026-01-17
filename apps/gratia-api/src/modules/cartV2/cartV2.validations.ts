import { z } from "zod";
import { CART_LIMITS } from "./cartV2.constants";

export const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  sku: z.string().min(1, "SKU is required").trim(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(CART_LIMITS.MAX_QUANTITY_PER_ITEM, `Quantity cannot exceed ${CART_LIMITS.MAX_QUANTITY_PER_ITEM}`),
});

export const updateCartItemSchema = z.object({
  sku: z.string().min(1, "SKU is required").trim(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be less than 0")
    .max(CART_LIMITS.MAX_QUANTITY_PER_ITEM, `Quantity cannot exceed ${CART_LIMITS.MAX_QUANTITY_PER_ITEM}`),
});

export const removeFromCartParamsSchema = z.object({
  sku: z.string().min(1, "SKU is required").trim(),
});

export const syncCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        sku: z.string().min(1, "SKU is required").trim(),
        quantity: z
          .number()
          .int("Quantity must be an integer")
          .min(1, "Quantity cannot be less than 1")
          .max(CART_LIMITS.MAX_QUANTITY_PER_ITEM, `Quantity cannot exceed ${CART_LIMITS.MAX_QUANTITY_PER_ITEM}`),
      })
    )
    .max(CART_LIMITS.MAX_ITEMS, `Cannot sync more than ${CART_LIMITS.MAX_ITEMS} items at once`),
});

export type AddToCartDto = z.infer<typeof addToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
export type SyncCartDto = z.infer<typeof syncCartSchema>;
