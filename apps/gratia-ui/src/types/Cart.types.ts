import { IApiResponse } from "./Api.types";

// ============================================================================
// Cart Status & Warning Types
// ============================================================================

/**
 * Item availability status
 */
export type CartItemStatus =
  | "available"
  | "out_of_stock"
  | "low_stock"
  | "inactive"
  | "price_changed";

/**
 * Cart warning types
 */
export type CartWarningType =
  | "price_increased"
  | "price_decreased"
  | "low_stock"
  | "out_of_stock"
  | "inactive";

// ============================================================================
// Cart Item Types
// ============================================================================

/**
 * Cart item with full product details
 */
export interface CartItem {
  /** Product SKU (unique identifier) */
  sku: string;

  /** Product ID */
  productId: number;

  /** Product name */
  productName: string;

  /** Product slug for URL */
  productSlug: string;

  /** Product images */
  productImages: string[];

  /** Quantity in cart */
  quantity: number;

  /** Current price (may differ from original) */
  price: string;

  /** Price when item was added */
  originalPrice: string;

  /** Current discounted price (if any) */
  discountedPrice: string | null;

  /** Product attributes (color, size, etc.) */
  attributes: Record<string, string>;

  /** Whether this is a variant product */
  isVariant: boolean;

  /** Current availability status */
  status: CartItemStatus;

  /** Current available stock */
  stockAvailable: number;

  /** When item was added to cart */
  addedAt: string;

  /** When item was last updated */
  updatedAt: string;
}

/**
 * Minimal cart item for local storage
 */
export interface StoredCartItem {
  sku: string;
  productId: number;
  quantity: number;
  originalPrice: string;
  addedAt: string;
  updatedAt: string;
}

// ============================================================================
// Cart Summary & Warning Types
// ============================================================================

/**
 * Cart totals and summary
 */
export interface CartSummary {
  /** Total quantity of all items */
  totalItems: number;

  /** Number of unique SKUs */
  uniqueItems: number;

  /** Subtotal (original prices) */
  subtotal: string;

  /** Total discount amount */
  discount: string;

  /** Final total */
  total: string;

  /** Number of unavailable items */
  unavailableCount: number;
}

/**
 * Cart warning for price changes, stock issues, etc.
 */
export interface CartWarning {
  type: CartWarningType;
  sku: string;
  productName: string;
  message: string;
  oldValue?: string;
  newValue?: string;
}

// ============================================================================
// Cart Response Types
// ============================================================================

/**
 * Full cart response from API
 */
export interface CartData {
  /** Cart ID (sessionId for guest, visibleId for user) */
  id: string;

  /** Cart items with full details */
  items: CartItem[];

  /** Cart summary (totals, counts) */
  summary: CartSummary;

  /** Warnings (price changes, stock issues) */
  warnings: CartWarning[];

  /** When cart was created */
  createdAt: string;

  /** When cart was last updated */
  updatedAt: string;
}

// ============================================================================
// Guest Response Types
// ============================================================================

/**
 * Guest cart endpoints return both sessionId and cart payload.
 */
export interface GuestCartData {
  sessionId: string;
  cart: CartData;
}

// ============================================================================
// Cart Operation DTOs
// ============================================================================

/**
 * Add item to cart request
 */
export interface AddToCartDto {
  sku: string;
  quantity: number;
}

/**
 * Update cart item request
 */
export interface UpdateCartItemDto {
  quantity: number;
}

/**
 * Merge guest cart to user cart request
 */
export interface MergeCartDto {
  sessionId: string;
}

// ============================================================================
// Cart Merge Types
// ============================================================================

/**
 * Merge statistics
 */
export interface CartMergeStats {
  /** SKUs added from guest cart */
  added: string[];

  /** SKUs with updated quantity */
  updated: string[];

  /** SKUs that couldn't be merged (validation failed) */
  skipped: string[];
}

/**
 * Result of cart merge operation
 */
export interface CartMergeResult {
  /** Updated user cart */
  cart: CartData;

  /** Merge statistics */
  merged: CartMergeStats;

  /** Whether guest cart was cleared */
  guestCartCleared: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export type CartResponse = IApiResponse<CartData>;
export type GuestCartResponse = IApiResponse<GuestCartData>;
export type CartMergeResponse = IApiResponse<CartMergeResult>;

// ============================================================================
// Local Cart State Types
// ============================================================================

/**
 * Local guest cart state (stored in localStorage)
 */
export interface GuestCartState {
  sessionId: string | null;
  items: StoredCartItem[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Cart Product Types (for adding to cart)
// ============================================================================

/**
 * Minimal product data needed to add to cart
 */
export interface CartableProduct {
  id: number;
  sku: string;
  name: string;
  price: number | string;
  discountedPrice?: number | string | null;
  images?: string[];
  slug?: string;
  // Product attributes can come from multiple sources (product detail uses unknown values)
  // Only sku/quantity are required for cart operations; attributes are optional metadata.
  attributes?: Record<string, unknown>;
  stock?: number;
}