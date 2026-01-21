import { getRedisClient } from "../../../config/redis.config";
import {
  CART_LIMITS,
  CART_REDIS_KEYS,
} from "../cart.constants";
import type { GuestCartData, StoredCartItem } from "../cart.types";

// ============================================================================
// Guest Cart Repository - Redis Operations
// ============================================================================

/**
 * Get guest cart data from Redis
 */
export const getGuestCartData = async (
  sessionId: string
): Promise<GuestCartData | null> => {
  const client = getRedisClient();
  const key = CART_REDIS_KEYS.GUEST_CART(sessionId);
  const data = await client.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as GuestCartData;
};

/**
 * Save guest cart data to Redis with TTL refresh
 */
export const saveGuestCartData = async (
  cartData: GuestCartData
): Promise<void> => {
  const client = getRedisClient();
  const key = CART_REDIS_KEYS.GUEST_CART(cartData.sessionId);

  await client.setEx(
    key,
    CART_LIMITS.GUEST_CART_TTL_SECONDS,
    JSON.stringify(cartData)
  );
};

/**
 * Delete guest cart from Redis
 */
export const deleteGuestCart = async (sessionId: string): Promise<void> => {
  const client = getRedisClient();
  const key = CART_REDIS_KEYS.GUEST_CART(sessionId);
  await client.del(key);
};

/**
 * Check if guest cart exists
 */
export const guestCartExists = async (sessionId: string): Promise<boolean> => {
  const client = getRedisClient();
  const key = CART_REDIS_KEYS.GUEST_CART(sessionId);
  const exists = await client.exists(key);
  return exists === 1;
};

/**
 * Get guest cart TTL (remaining time in seconds)
 */
export const getGuestCartTTL = async (sessionId: string): Promise<number> => {
  const client = getRedisClient();
  const key = CART_REDIS_KEYS.GUEST_CART(sessionId);
  return client.ttl(key);
};

/**
 * Create empty guest cart data
 */
export const createEmptyGuestCartData = (sessionId: string): GuestCartData => {
  const now = new Date().toISOString();
  return {
    sessionId,
    items: [],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Add item to guest cart data (in-memory operation)
 */
export const addItemToGuestCartData = (
  cartData: GuestCartData,
  item: StoredCartItem
): GuestCartData => {
  const existingIndex = cartData.items.findIndex((i) => i.sku === item.sku);

  const existingItem = existingIndex >= 0 ? cartData.items[existingIndex] : null;

  if (existingItem) {
    // Update existing item quantity
    const newQuantity = Math.min(
      existingItem.quantity + item.quantity,
      CART_LIMITS.MAX_QUANTITY_PER_ITEM
    );
    cartData.items[existingIndex] = {
      ...existingItem,
      quantity: newQuantity,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Add new item
    cartData.items.push(item);
  }

  cartData.updatedAt = new Date().toISOString();
  return cartData;
};

/**
 * Update item quantity in guest cart data (in-memory operation)
 */
export const updateItemInGuestCartData = (
  cartData: GuestCartData,
  sku: string,
  quantity: number
): GuestCartData | null => {
  const existingIndex = cartData.items.findIndex((i) => i.sku === sku);
  const existingItem = existingIndex >= 0 ? cartData.items[existingIndex] : null;

  if (!existingItem) {
    return null;
  }

  cartData.items[existingIndex] = {
    ...existingItem,
    quantity: Math.min(quantity, CART_LIMITS.MAX_QUANTITY_PER_ITEM),
    updatedAt: new Date().toISOString(),
  };

  cartData.updatedAt = new Date().toISOString();
  return cartData;
};

/**
 * Remove item from guest cart data (in-memory operation)
 */
export const removeItemFromGuestCartData = (
  cartData: GuestCartData,
  sku: string
): GuestCartData | null => {
  const existingIndex = cartData.items.findIndex((i) => i.sku === sku);

  if (existingIndex < 0) {
    return null;
  }

  cartData.items.splice(existingIndex, 1);
  cartData.updatedAt = new Date().toISOString();
  return cartData;
};

/**
 * Clear all items from guest cart data (in-memory operation)
 */
export const clearGuestCartData = (cartData: GuestCartData): GuestCartData => {
  cartData.items = [];
  cartData.updatedAt = new Date().toISOString();
  return cartData;
};