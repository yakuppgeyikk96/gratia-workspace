import crypto from "crypto";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CART_LIMITS, CART_MESSAGES } from "../cart.constants";
import type {
  AddToCartDto,
  CartResponse,
  StoredCartItem,
  UpdateCartItemDto,
} from "../cart.types";
import {
  addItemToGuestCartData,
  clearGuestCartData,
  createEmptyGuestCartData,
  deleteGuestCart,
  getGuestCartData,
  removeItemFromGuestCartData,
  saveGuestCartData,
  updateItemInGuestCartData,
} from "../repositories/guest-cart.repository";
import {
  buildCartResponse,
  validateCartItems,
  validateSingleItem,
} from "./cart-validation.service";

// ============================================================================
// Guest Cart Service - Redis-based cart for unauthenticated users
// ============================================================================

/**
 * Generate a new guest session ID
 */
export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

/**
 * Get guest cart by session ID
 * Returns null if cart doesn't exist
 */
export const getGuestCart = async (
  sessionId: string,
): Promise<CartResponse | null> => {
  const cartData = await getGuestCartData(sessionId);

  if (!cartData) {
    return null;
  }

  // Validate items against current product state
  const validationResult = await validateCartItems(cartData.items);

  return buildCartResponse(
    sessionId,
    validationResult,
    cartData.createdAt,
    cartData.updatedAt,
  );
};

/**
 * Get or create guest cart
 * Creates a new cart if session doesn't have one
 */
export const getOrCreateGuestCart = async (
  sessionId: string,
): Promise<CartResponse> => {
  let cartData = await getGuestCartData(sessionId);

  if (!cartData) {
    cartData = createEmptyGuestCartData(sessionId);
    await saveGuestCartData(cartData);
  }

  const validationResult = await validateCartItems(cartData.items);

  return buildCartResponse(
    sessionId,
    validationResult,
    cartData.createdAt,
    cartData.updatedAt,
  );
};

/**
 * Add item to guest cart
 */
export const addToGuestCart = async (
  sessionId: string,
  dto: AddToCartDto,
): Promise<CartResponse> => {
  // Validate product
  const validation = await validateSingleItem(dto.sku, dto.quantity);

  if (!validation) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  const { product } = validation;

  // Check stock
  if (product.stock <= 0) {
    throw new AppError(CART_MESSAGES.INSUFFICIENT_STOCK, ErrorCode.BAD_REQUEST);
  }

  // Get or create cart
  let cartData = await getGuestCartData(sessionId);

  if (!cartData) {
    cartData = createEmptyGuestCartData(sessionId);
  }

  // Check item limit
  const existingItem = cartData.items.find((i) => i.sku === dto.sku);
  if (!existingItem && cartData.items.length >= CART_LIMITS.MAX_UNIQUE_ITEMS) {
    throw new AppError(CART_MESSAGES.MAX_ITEMS_EXCEEDED, ErrorCode.BAD_REQUEST);
  }

  // Calculate new quantity
  const currentQty = existingItem?.quantity || 0;
  const newQty = Math.min(
    currentQty + dto.quantity,
    CART_LIMITS.MAX_QUANTITY_PER_ITEM,
  );

  // Check if quantity exceeds stock
  if (newQty > product.stock) {
    throw new AppError(
      `${CART_MESSAGES.INSUFFICIENT_STOCK}. Only ${product.stock} available.`,
      ErrorCode.BAD_REQUEST,
    );
  }

  // Create stored item
  const now = new Date().toISOString();
  const storedItem: StoredCartItem = {
    sku: dto.sku,
    productId: product.id,
    quantity: dto.quantity,
    originalPrice: product.discountedPrice || product.price,
    addedAt: existingItem?.addedAt || now,
    updatedAt: now,
  };

  // Add to cart
  cartData = addItemToGuestCartData(cartData, storedItem);
  await saveGuestCartData(cartData);

  // Return validated cart
  const validationResult = await validateCartItems(cartData.items);

  return buildCartResponse(
    sessionId,
    validationResult,
    cartData.createdAt,
    cartData.updatedAt,
  );
};

/**
 * Update guest cart item quantity
 */
export const updateGuestCartItem = async (
  sessionId: string,
  sku: string,
  dto: UpdateCartItemDto,
): Promise<CartResponse> => {
  const cartData = await getGuestCartData(sessionId);

  if (!cartData) {
    throw new AppError(CART_MESSAGES.CART_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // Check if item exists
  const existingItem = cartData.items.find((i) => i.sku === sku);
  if (!existingItem) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_IN_CART, ErrorCode.NOT_FOUND);
  }

  // Validate product
  const validation = await validateSingleItem(sku, dto.quantity);

  if (!validation) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  const { product } = validation;

  // Check stock
  if (dto.quantity > product.stock) {
    throw new AppError(
      `${CART_MESSAGES.INSUFFICIENT_STOCK}. Only ${product.stock} available.`,
      ErrorCode.BAD_REQUEST,
    );
  }

  // Update item
  const updatedCartData = updateItemInGuestCartData(
    cartData,
    sku,
    dto.quantity,
  );

  if (!updatedCartData) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_IN_CART, ErrorCode.NOT_FOUND);
  }

  await saveGuestCartData(updatedCartData);

  // Return validated cart
  const validationResult = await validateCartItems(updatedCartData.items);

  return buildCartResponse(
    sessionId,
    validationResult,
    updatedCartData.createdAt,
    updatedCartData.updatedAt,
  );
};

/**
 * Remove item from guest cart
 */
export const removeFromGuestCart = async (
  sessionId: string,
  sku: string,
): Promise<CartResponse> => {
  const cartData = await getGuestCartData(sessionId);

  if (!cartData) {
    throw new AppError(CART_MESSAGES.CART_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // Remove item
  const updatedCartData = removeItemFromGuestCartData(cartData, sku);

  if (!updatedCartData) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_IN_CART, ErrorCode.NOT_FOUND);
  }

  await saveGuestCartData(updatedCartData);

  // Return validated cart
  const validationResult = await validateCartItems(updatedCartData.items);

  return buildCartResponse(
    sessionId,
    validationResult,
    updatedCartData.createdAt,
    updatedCartData.updatedAt,
  );
};

/**
 * Clear guest cart (remove all items)
 */
export const clearGuestCart = async (
  sessionId: string,
): Promise<CartResponse> => {
  let cartData = await getGuestCartData(sessionId);

  if (!cartData) {
    // Return empty cart
    cartData = createEmptyGuestCartData(sessionId);
  } else {
    cartData = clearGuestCartData(cartData);
  }

  await saveGuestCartData(cartData);

  return buildCartResponse(
    sessionId,
    { items: [], warnings: [], summary: createEmptySummary() },
    cartData.createdAt,
    cartData.updatedAt,
  );
};

/**
 * Delete guest cart completely (used after merge)
 */
export const deleteGuestCartComplete = async (
  sessionId: string,
): Promise<void> => {
  await deleteGuestCart(sessionId);
};

/**
 * Get raw guest cart data (for merge operations)
 */
export const getGuestCartItems = async (
  sessionId: string,
): Promise<StoredCartItem[]> => {
  const cartData = await getGuestCartData(sessionId);
  return cartData?.items || [];
};

// ============================================================================
// Helper Functions
// ============================================================================

const createEmptySummary = () => ({
  totalItems: 0,
  uniqueItems: 0,
  subtotal: "0.00",
  discount: "0.00",
  total: "0.00",
  unavailableCount: 0,
});
