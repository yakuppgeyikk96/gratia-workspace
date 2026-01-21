import { CART_LIMITS } from "../cart.constants";
import type { CartMergeResult } from "../cart.types";
import {
  getGuestCartItems,
  deleteGuestCartComplete,
} from "./guest-cart.service";
import {
  getUserCart,
  addStoredItemToUserCart,
  updateUserCartItemQuantityBySku,
  recalculateUserCart,
} from "./user-cart.service";
import { findProductsBySkus, toCartProductData } from "../repositories/cart.repository";

// ============================================================================
// Cart Merge Service
// ============================================================================

/**
 * Merge guest cart into user cart
 *
 * Strategy: Guest-Preferred
 * - If SKU exists in both carts: Use GUEST quantity (user's latest intent)
 * - If SKU only in guest cart: Add to user cart
 * - If SKU only in user cart: Keep as-is
 *
 * Validation:
 * - Skip unavailable/inactive products
 * - Respect stock limits
 * - Respect quantity limits
 *
 * @param userId - Authenticated user ID
 * @param sessionId - Guest cart session ID
 */
export const mergeGuestToUserCart = async (
  userId: number,
  sessionId: string
): Promise<CartMergeResult> => {
  // Get guest cart items
  const guestItems = await getGuestCartItems(sessionId);

  // If no guest items, just return user cart
  if (!guestItems || guestItems.length === 0) {
    const userCart = await getUserCart(userId);
    return {
      cart: userCart,
      merged: {
        added: [],
        updated: [],
        skipped: [],
      },
      guestCartCleared: true,
    };
  }

  // Get current user cart for comparison
  const userCartBefore = await getUserCart(userId);
  const userSkuSet = new Set(userCartBefore.items.map((i) => i.sku));

  // Track merge results
  const mergeResult = {
    added: [] as string[],
    updated: [] as string[],
    skipped: [] as string[],
  };

  // Fetch product data for all guest items
  const guestSkus = guestItems.map((i) => i.sku);
  const productMap = await findProductsBySkus(guestSkus);

  // Process each guest item
  for (const guestItem of guestItems) {
    const product = productMap.get(guestItem.sku);

    // Skip if product not found or inactive
    if (!product || !product.isActive) {
      mergeResult.skipped.push(guestItem.sku);
      continue;
    }

    const productData = toCartProductData(product);

    // Skip if out of stock
    if (productData.stock === 0) {
      mergeResult.skipped.push(guestItem.sku);
      continue;
    }

    // Calculate effective quantity (respect limits)
    const effectiveQuantity = Math.min(
      guestItem.quantity,
      CART_LIMITS.MAX_QUANTITY_PER_ITEM,
      productData.stock
    );

    if (effectiveQuantity <= 0) {
      mergeResult.skipped.push(guestItem.sku);
      continue;
    }

    try {
      if (userSkuSet.has(guestItem.sku)) {
        // SKU exists in user cart - update with guest quantity (guest-preferred)
        await updateUserCartItemQuantityBySku(userId, guestItem.sku, effectiveQuantity);
        mergeResult.updated.push(guestItem.sku);
      } else {
        // New item - add to user cart
        // Check user cart item limit
        const currentItemCount = userCartBefore.items.length + mergeResult.added.length;
        if (currentItemCount >= CART_LIMITS.MAX_UNIQUE_ITEMS) {
          mergeResult.skipped.push(guestItem.sku);
          continue;
        }

        await addStoredItemToUserCart(userId, {
          ...guestItem,
          quantity: effectiveQuantity,
        });
        mergeResult.added.push(guestItem.sku);
      }
    } catch (error) {
      // Log error but continue with other items
      console.error(`Failed to merge item ${guestItem.sku}:`, error);
      mergeResult.skipped.push(guestItem.sku);
    }
  }

  // Recalculate user cart totals
  await recalculateUserCart(userId);

  // Clear guest cart after successful merge
  await deleteGuestCartComplete(sessionId);

  // Get updated user cart
  const userCartAfter = await getUserCart(userId);

  return {
    cart: userCartAfter,
    merged: mergeResult,
    guestCartCleared: true,
  };
};

/**
 * Check if merge is needed
 * Returns true if guest cart has items
 */
export const isMergeNeeded = async (sessionId: string): Promise<boolean> => {
  const guestItems = await getGuestCartItems(sessionId);
  return guestItems.length > 0;
};

/**
 * Get merge preview (without actually merging)
 * Useful for showing user what will happen
 */
export const getMergePreview = async (
  userId: number,
  sessionId: string
): Promise<{
  guestItemCount: number;
  userItemCount: number;
  willAdd: number;
  willUpdate: number;
  willSkip: number;
}> => {
  const guestItems = await getGuestCartItems(sessionId);
  const userCart = await getUserCart(userId);

  if (guestItems.length === 0) {
    return {
      guestItemCount: 0,
      userItemCount: userCart.items.length,
      willAdd: 0,
      willUpdate: 0,
      willSkip: 0,
    };
  }

  const userSkuSet = new Set(userCart.items.map((i) => i.sku));
  const guestSkus = guestItems.map((i) => i.sku);
  const productMap = await findProductsBySkus(guestSkus);

  let willAdd = 0;
  let willUpdate = 0;
  let willSkip = 0;

  for (const guestItem of guestItems) {
    const product = productMap.get(guestItem.sku);

    if (!product || !product.isActive || product.stock === 0) {
      willSkip++;
      continue;
    }

    if (userSkuSet.has(guestItem.sku)) {
      willUpdate++;
    } else {
      // Check item limit
      if (userCart.items.length + willAdd >= CART_LIMITS.MAX_UNIQUE_ITEMS) {
        willSkip++;
      } else {
        willAdd++;
      }
    }
  }

  return {
    guestItemCount: guestItems.length,
    userItemCount: userCart.items.length,
    willAdd,
    willUpdate,
    willSkip,
  };
};