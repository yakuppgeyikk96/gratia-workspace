import { getRedisClient } from "../../../config/redis.config";
import {
  CART_LIMITS,
  CART_REDIS_KEYS,
  CART_MESSAGES,
} from "../cart.constants";
import type {
  StockReserveItem,
  StockReserveResult,
  StockReserveFailure,
} from "../cart.types";
import {
  findProductsBySkus,
  decreaseProductStock,
} from "../repositories/cart.repository";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";

// ============================================================================
// Stock Reserve Service - Hard Reserve at Checkout
// ============================================================================

/**
 * Reserve stock for checkout session
 *
 * Flow:
 * 1. Check current available stock (DB stock - existing locks)
 * 2. Create Redis lock for each item (TTL: 15 minutes)
 * 3. If any item fails, rollback all locks
 *
 * @param sessionId - Checkout session ID (Stripe or internal)
 * @param items - Items to reserve
 */
export const reserveStockForCheckout = async (
  sessionId: string,
  items: StockReserveItem[]
): Promise<StockReserveResult> => {
  if (items.length === 0) {
    return { reserved: [], expiresIn: CART_LIMITS.STOCK_LOCK_TTL_SECONDS };
  }

  const client = getRedisClient();
  const reserved: string[] = [];
  const failed: StockReserveFailure[] = [];

  // Get all products
  const skus = items.map((i) => i.sku);
  const productMap = await findProductsBySkus(skus);

  for (const item of items) {
    const product = productMap.get(item.sku);

    // Check product exists and is active
    if (!product) {
      failed.push({
        sku: item.sku,
        reason: CART_MESSAGES.PRODUCT_NOT_FOUND,
        availableStock: 0,
      });
      continue;
    }

    if (!product.isActive) {
      failed.push({
        sku: item.sku,
        reason: CART_MESSAGES.PRODUCT_INACTIVE,
        availableStock: 0,
      });
      continue;
    }

    // Calculate available stock (DB stock - existing locks)
    const lockedQuantity = await getLockedQuantityForSku(item.sku);
    const availableStock = product.stock - lockedQuantity;

    if (availableStock < item.quantity) {
      failed.push({
        sku: item.sku,
        reason: `${CART_MESSAGES.INSUFFICIENT_STOCK}. Only ${availableStock} available.`,
        availableStock,
      });
      continue;
    }

    // Create lock
    const lockKey = CART_REDIS_KEYS.STOCK_LOCK(item.sku, sessionId);
    await client.setEx(
      lockKey,
      CART_LIMITS.STOCK_LOCK_TTL_SECONDS,
      String(item.quantity)
    );
    reserved.push(item.sku);
  }

  // If any failed, rollback all locks
  if (failed.length > 0) {
    // Rollback reserved locks
    for (const sku of reserved) {
      const lockKey = CART_REDIS_KEYS.STOCK_LOCK(sku, sessionId);
      await client.del(lockKey);
    }

    throw new AppError(
      `${CART_MESSAGES.STOCK_RESERVE_FAILED}: ${failed.map(f => f.sku).join(', ')}`,
      ErrorCode.CONFLICT,
      409
    );
  }

  return {
    reserved,
    expiresIn: CART_LIMITS.STOCK_LOCK_TTL_SECONDS,
  };
};

/**
 * Release stock reservation (manual release or cleanup)
 *
 * Called when:
 * - User cancels checkout
 * - Payment fails
 * - Session expires (though TTL handles this automatically)
 *
 * @param sessionId - Checkout session ID
 */
export const releaseStockReservation = async (
  sessionId: string
): Promise<void> => {
  const client = getRedisClient();
  const pattern = CART_REDIS_KEYS.STOCK_LOCK_PATTERN(sessionId);
  const keys = await client.keys(pattern);

  if (keys.length > 0) {
    await client.del(keys);
  }
};

/**
 * Commit stock reservation (decrease DB stock)
 *
 * Called when payment is successful
 * 1. Decrease stock in database (atomic transaction)
 * 2. Release Redis locks
 *
 * @param sessionId - Checkout session ID
 * @param items - Items that were reserved
 */
export const commitStockReservation = async (
  sessionId: string,
  items: StockReserveItem[]
): Promise<void> => {
  // Decrease stock in DB (transactional)
  await decreaseProductStock(items);

  // Release locks (they would expire anyway, but clean up immediately)
  await releaseStockReservation(sessionId);
};

/**
 * Get total locked quantity for a SKU (across all sessions)
 *
 * Used to calculate actual available stock
 */
export const getLockedQuantityForSku = async (sku: string): Promise<number> => {
  const client = getRedisClient();
  const pattern = CART_REDIS_KEYS.STOCK_LOCK_BY_SKU_PATTERN(sku);
  const keys = await client.keys(pattern);

  if (keys.length === 0) {
    return 0;
  }

  // Get all lock values
  const values = await client.mGet(keys);
  let totalLocked = 0;

  for (const value of values) {
    if (value) {
      totalLocked += parseInt(value, 10) || 0;
    }
  }

  return totalLocked;
};

/**
 * Get reservation status for a session
 *
 * Returns list of reserved items with their quantities
 */
export const getReservationStatus = async (
  sessionId: string
): Promise<{ sku: string; quantity: number; ttl: number }[]> => {
  const client = getRedisClient();
  const pattern = CART_REDIS_KEYS.STOCK_LOCK_PATTERN(sessionId);
  const keys = await client.keys(pattern);

  if (keys.length === 0) {
    return [];
  }

  const result: { sku: string; quantity: number; ttl: number }[] = [];

  for (const key of keys) {
    // Extract SKU from key: stock:lock:{sku}:{sessionId}
    const parts = key.split(":");
    const sku = parts[2];

    if (!sku) continue;

    const [value, ttl] = await Promise.all([client.get(key), client.ttl(key)]);

    if (value) {
      result.push({
        sku,
        quantity: parseInt(value, 10) || 0,
        ttl,
      });
    }
  }

  return result;
};

/**
 * Extend reservation TTL (if user needs more time)
 *
 * @param sessionId - Checkout session ID
 * @param additionalSeconds - Additional seconds to add (max: original TTL)
 */
export const extendReservation = async (
  sessionId: string,
  additionalSeconds: number = CART_LIMITS.STOCK_LOCK_TTL_SECONDS
): Promise<void> => {
  const client = getRedisClient();
  const pattern = CART_REDIS_KEYS.STOCK_LOCK_PATTERN(sessionId);
  const keys = await client.keys(pattern);

  if (keys.length === 0) {
    return;
  }

  // Cap extension to original TTL
  const extensionSeconds = Math.min(
    additionalSeconds,
    CART_LIMITS.STOCK_LOCK_TTL_SECONDS
  );

  for (const key of keys) {
    const currentTtl = await client.ttl(key);
    if (currentTtl > 0) {
      await client.expire(key, currentTtl + extensionSeconds);
    }
  }
};

/**
 * Check if stock is available for items (considering locks)
 *
 * Utility function for validation before checkout
 */
export const checkStockAvailability = async (
  items: StockReserveItem[]
): Promise<{ available: boolean; failures: StockReserveFailure[] }> => {
  if (items.length === 0) {
    return { available: true, failures: [] };
  }

  const skus = items.map((i) => i.sku);
  const productMap = await findProductsBySkus(skus);
  const failures: StockReserveFailure[] = [];

  for (const item of items) {
    const product = productMap.get(item.sku);

    if (!product) {
      failures.push({
        sku: item.sku,
        reason: CART_MESSAGES.PRODUCT_NOT_FOUND,
        availableStock: 0,
      });
      continue;
    }

    if (!product.isActive) {
      failures.push({
        sku: item.sku,
        reason: CART_MESSAGES.PRODUCT_INACTIVE,
        availableStock: 0,
      });
      continue;
    }

    const lockedQuantity = await getLockedQuantityForSku(item.sku);
    const availableStock = product.stock - lockedQuantity;

    if (availableStock < item.quantity) {
      failures.push({
        sku: item.sku,
        reason: CART_MESSAGES.INSUFFICIENT_STOCK,
        availableStock,
      });
    }
  }

  return {
    available: failures.length === 0,
    failures,
  };
};