// ============================================================================
// Cart Module Exports
// ============================================================================

// Routes
export { default as cartRoutes } from "./cart.routes";

// Constants
export * from "./cart.constants";

// Types
export * from "./cart.types";

// Services
export {
  // Guest Cart
  getGuestCart,
  getOrCreateGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  deleteGuestCartComplete,
  getGuestCartItems,
  generateSessionId,
} from "./services/guest-cart.service";

export {
  // User Cart
  getUserCart,
  addToUserCart,
  updateUserCartItem,
  removeFromUserCart,
  clearUserCart,
} from "./services/user-cart.service";

export {
  // Cart Merge
  mergeGuestToUserCart,
  isMergeNeeded,
  getMergePreview,
} from "./services/cart-merge.service";

export {
  // Cart Validation
  validateCartItems,
  validateSingleItem,
  buildCartResponse,
} from "./services/cart-validation.service";

export {
  // Stock Reserve (for checkout integration)
  reserveStockForCheckout,
  releaseStockReservation,
  commitStockReservation,
  getLockedQuantityForSku,
  getReservationStatus,
  extendReservation,
  checkStockAvailability,
} from "./services/stock-reserve.service";