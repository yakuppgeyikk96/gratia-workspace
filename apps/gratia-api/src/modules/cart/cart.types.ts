// ============================================================================
// Cart V2 Type Definitions
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
 * Minimal cart item for storage (Redis/DB)
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
 * Full cart response
 */
export interface CartResponse {
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

/**
 * Guest cart data stored in Redis
 */
export interface GuestCartData {
  sessionId: string;
  items: StoredCartItem[];
  createdAt: string;
  updatedAt: string;
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
 * Result of cart merge operation
 */
export interface CartMergeResult {
  /** Updated user cart */
  cart: CartResponse;

  /** Merge statistics */
  merged: {
    /** SKUs added from guest cart */
    added: string[];

    /** SKUs with updated quantity */
    updated: string[];

    /** SKUs that couldn't be merged (validation failed) */
    skipped: string[];
  };

  /** Whether guest cart was cleared */
  guestCartCleared: boolean;
}

// ============================================================================
// Stock Reserve Types
// ============================================================================

/**
 * Stock reservation request item
 */
export interface StockReserveItem {
  sku: string;
  quantity: number;
}

/**
 * Stock reservation result
 */
export interface StockReserveResult {
  /** Successfully reserved SKUs */
  reserved: string[];

  /** TTL in seconds */
  expiresIn: number;
}

/**
 * Stock reservation failure
 */
export interface StockReserveFailure {
  sku: string;
  reason: string;
  availableStock: number;
}

// ============================================================================
// Product Data Types (for validation)
// ============================================================================

/**
 * Product data needed for cart operations
 */
export interface CartProductData {
  id: number;
  sku: string;
  slug: string;
  name: string;
  price: string;
  discountedPrice: string | null;
  stock: number;
  isActive: boolean;
  images: string[];
  attributes: Record<string, string>;
  isVariant: boolean;
}

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Result of validating cart items against current product state
 */
export interface CartValidationResult {
  /** Validated items with current product data */
  items: CartItem[];

  /** Warnings generated during validation */
  warnings: CartWarning[];

  /** Summary calculated from validated items */
  summary: CartSummary;
}
