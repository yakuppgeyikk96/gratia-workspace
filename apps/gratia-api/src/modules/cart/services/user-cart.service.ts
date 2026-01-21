import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CART_LIMITS, CART_MESSAGES } from "../cart.constants";
import type {
  AddToCartDto,
  CartResponse,
  StoredCartItem,
  UpdateCartItemDto,
} from "../cart.types";
import {
  addItemToCart,
  clearAndResetCart,
  findCartWithItemsByUserId,
  findOrCreateCartWithItems,
  findProductsBySkus,
  recalculateAndUpdateCart,
  removeCartItemBySku,
  toCartProductData,
  toNewCartItem,
  toStoredCartItem,
  updateCartItemBySku,
} from "../repositories/cart.repository";
import {
  buildCartResponse,
  validateCartItems,
  validateSingleItem,
} from "./cart-validation.service";

// ============================================================================
// User Cart Service - PostgreSQL-based cart for authenticated users
// ============================================================================

/**
 * Get user cart
 */
export const getUserCart = async (userId: number): Promise<CartResponse> => {
  const result = await findOrCreateCartWithItems(userId);

  // Convert DB items to StoredCartItems for validation
  const storedItems: StoredCartItem[] = result.items.map(toStoredCartItem);

  // Validate against current product state
  const validationResult = await validateCartItems(storedItems);

  return buildCartResponse(
    String(result.cart.id),
    validationResult,
    result.cart.createdAt.toISOString(),
    result.cart.updatedAt.toISOString()
  );
};

/**
 * Add item to user cart
 */
export const addToUserCart = async (
  userId: number,
  dto: AddToCartDto
): Promise<CartResponse> => {
  // Validate product
  const validation = await validateSingleItem(dto.sku, dto.quantity);

  if (!validation) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  const { product } = validation;

  // Check stock
  if (product.stock === 0) {
    throw new AppError(CART_MESSAGES.INSUFFICIENT_STOCK, ErrorCode.BAD_REQUEST);
  }

  // Get or create cart
  const { cart, items } = await findOrCreateCartWithItems(userId);

  // Check item limit
  const existingItem = items.find((i) => i.sku === dto.sku);
  if (!existingItem && items.length >= CART_LIMITS.MAX_UNIQUE_ITEMS) {
    throw new AppError(CART_MESSAGES.MAX_ITEMS_EXCEEDED, ErrorCode.BAD_REQUEST);
  }

  // Calculate new quantity
  const currentQty = existingItem?.quantity || 0;
  const newQty = Math.min(
    currentQty + dto.quantity,
    CART_LIMITS.MAX_QUANTITY_PER_ITEM
  );

  // Check if quantity exceeds stock
  if (newQty > product.stock) {
    throw new AppError(
      `${CART_MESSAGES.INSUFFICIENT_STOCK}. Only ${product.stock} available.`,
      ErrorCode.BAD_REQUEST
    );
  }

  if (existingItem) {
    // Update existing item
    await updateCartItemBySku(cart.id, dto.sku, newQty);
  } else {
    // Add new item
    await addItemToCart(cart.id, {
      productId: product.id,
      sku: dto.sku,
      productName: product.name,
      productImages: product.images,
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity: dto.quantity,
      attributes: product.attributes,
      isVariant: product.isVariant,
    });
  }

  // Recalculate totals
  await recalculateAndUpdateCart(cart.id);

  // Return updated cart
  return getUserCart(userId);
};

/**
 * Update user cart item quantity
 */
export const updateUserCartItem = async (
  userId: number,
  sku: string,
  dto: UpdateCartItemDto
): Promise<CartResponse> => {
  const result = await findCartWithItemsByUserId(userId);

  if (!result) {
    throw new AppError(CART_MESSAGES.CART_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  const { cart, items } = result;

  // Check if item exists
  const existingItem = items.find((i) => i.sku === sku);
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
      ErrorCode.BAD_REQUEST
    );
  }

  // Update item
  await updateCartItemBySku(cart.id, sku, dto.quantity);

  // Recalculate totals
  await recalculateAndUpdateCart(cart.id);

  // Return updated cart
  return getUserCart(userId);
};

/**
 * Remove item from user cart
 */
export const removeFromUserCart = async (
  userId: number,
  sku: string
): Promise<CartResponse> => {
  const result = await findCartWithItemsByUserId(userId);

  if (!result) {
    throw new AppError(CART_MESSAGES.CART_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  const { cart, items } = result;

  // Check if item exists
  const existingItem = items.find((i) => i.sku === sku);
  if (!existingItem) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_IN_CART, ErrorCode.NOT_FOUND);
  }

  // Remove item
  await removeCartItemBySku(cart.id, sku);

  // Recalculate totals
  await recalculateAndUpdateCart(cart.id);

  // Return updated cart
  return getUserCart(userId);
};

/**
 * Clear user cart (remove all items)
 */
export const clearUserCart = async (userId: number): Promise<CartResponse> => {
  const result = await findCartWithItemsByUserId(userId);

  if (!result) {
    // Return empty cart response
    const { cart } = await findOrCreateCartWithItems(userId);
    return buildCartResponse(
      String(cart.id),
      { items: [], warnings: [], summary: createEmptySummary() },
      cart.createdAt.toISOString(),
      cart.updatedAt.toISOString()
    );
  }

  // Clear and reset
  const { cart } = await clearAndResetCart(result.cart.id);

  return buildCartResponse(
    String(cart.id),
    { items: [], warnings: [], summary: createEmptySummary() },
    cart.createdAt.toISOString(),
    cart.updatedAt.toISOString()
  );
};

/**
 * Add item to user cart from StoredCartItem (used in merge)
 */
export const addStoredItemToUserCart = async (
  userId: number,
  storedItem: StoredCartItem
): Promise<void> => {
  const { cart, items } = await findOrCreateCartWithItems(userId);

  // Get product data
  const productMap = await findProductsBySkus([storedItem.sku]);
  const product = productMap.get(storedItem.sku);

  if (!product || !product.isActive) {
    // Skip inactive products
    return;
  }

  const productData = toCartProductData(product);

  // Check if item already exists
  const existingItem = items.find((i) => i.sku === storedItem.sku);

  if (existingItem) {
    // Use guest quantity (guest-preferred strategy)
    const newQty = Math.min(
      storedItem.quantity,
      CART_LIMITS.MAX_QUANTITY_PER_ITEM,
      productData.stock
    );
    await updateCartItemBySku(cart.id, storedItem.sku, newQty);
  } else {
    // Check item limit
    if (items.length >= CART_LIMITS.MAX_UNIQUE_ITEMS) {
      return;
    }

    // Add new item
    const newCartItem = toNewCartItem(storedItem, productData);
    newCartItem.quantity = Math.min(storedItem.quantity, productData.stock);
    await addItemToCart(cart.id, newCartItem);
  }
};

/**
 * Update user cart item quantity by SKU (used in merge)
 */
export const updateUserCartItemQuantityBySku = async (
  userId: number,
  sku: string,
  quantity: number
): Promise<void> => {
  const result = await findCartWithItemsByUserId(userId);

  if (!result) {
    return;
  }

  await updateCartItemBySku(result.cart.id, sku, quantity);
};

/**
 * Recalculate user cart totals (used after merge)
 */
export const recalculateUserCart = async (userId: number): Promise<void> => {
  const result = await findCartWithItemsByUserId(userId);

  if (result) {
    await recalculateAndUpdateCart(result.cart.id);
  }
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
