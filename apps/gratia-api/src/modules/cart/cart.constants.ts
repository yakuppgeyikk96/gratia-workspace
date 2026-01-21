// ============================================================================
// Cart Constants
// ============================================================================

/**
 * Cart limits and TTL configurations
 */
export const CART_LIMITS = {
  /** Maximum number of unique items (SKUs) in a cart */
  MAX_UNIQUE_ITEMS: 50,

  /** Maximum quantity per item */
  MAX_QUANTITY_PER_ITEM: 10,

  /** Guest cart TTL in days */
  GUEST_CART_TTL_DAYS: 7,

  /** Guest cart TTL in seconds (7 days) */
  GUEST_CART_TTL_SECONDS: 7 * 24 * 60 * 60, // 604800

  /** Stock lock TTL in minutes (for checkout) */
  STOCK_LOCK_TTL_MINUTES: 15,

  /** Stock lock TTL in seconds */
  STOCK_LOCK_TTL_SECONDS: 15 * 60, // 900

  /** Low stock threshold for warning */
  LOW_STOCK_THRESHOLD: 5,
} as const;

/**
 * Redis key generators for cart operations
 */
export const CART_REDIS_KEYS = {
  /** Guest cart key: cart:guest:{sessionId} */
  GUEST_CART: (sessionId: string) => `cart:guest:${sessionId}`,

  /** Stock lock key: stock:lock:{sku}:{sessionId} */
  STOCK_LOCK: (sku: string, sessionId: string) => `stock:lock:${sku}:${sessionId}`,

  /** Pattern for all stock locks for a session */
  STOCK_LOCK_PATTERN: (sessionId: string) => `stock:lock:*:${sessionId}`,

  /** Pattern for all stock locks for a SKU */
  STOCK_LOCK_BY_SKU_PATTERN: (sku: string) => `stock:lock:${sku}:*`,
} as const;

/**
 * Success and error messages
 */
export const CART_MESSAGES = {
  // Success messages
  CART_RETRIEVED: "Cart retrieved successfully",
  CART_CREATED: "Cart created successfully",
  ITEM_ADDED: "Item added to cart",
  ITEM_UPDATED: "Cart item updated",
  ITEM_REMOVED: "Item removed from cart",
  CART_CLEARED: "Cart cleared",
  CART_MERGED: "Carts merged successfully",
  STOCK_RESERVED: "Stock reserved successfully",
  STOCK_RELEASED: "Stock reservation released",

  // Error messages
  CART_NOT_FOUND: "Cart not found",
  ITEM_NOT_IN_CART: "Item not found in cart",
  PRODUCT_NOT_FOUND: "Product not found",
  PRODUCT_INACTIVE: "Product is no longer available",
  INSUFFICIENT_STOCK: "Insufficient stock available",
  MAX_QUANTITY_EXCEEDED: `Maximum ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} items per product allowed`,
  MAX_ITEMS_EXCEEDED: `Maximum ${CART_LIMITS.MAX_UNIQUE_ITEMS} unique items in cart allowed`,
  INVALID_SESSION: "Invalid or expired cart session",
  INVALID_QUANTITY: "Quantity must be a positive integer",
  STOCK_RESERVE_FAILED: "Failed to reserve stock for checkout",
  MERGE_FAILED: "Failed to merge carts",
} as const;

/**
 * Cookie names
 */
export const CART_COOKIES = {
  /** Guest cart session ID cookie name */
  SESSION_ID: "cart_session_id",
} as const;