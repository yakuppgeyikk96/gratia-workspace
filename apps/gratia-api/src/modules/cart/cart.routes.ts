import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import * as controller from "./cart.controller";

// ============================================================================
// Cart Routes
// ============================================================================

const router: Router = Router();

// ============================================================================
// Guest Cart Routes (No authentication required)
// Session ID from cookie: cart_session_id
// ============================================================================

/**
 * POST /api/v2/cart/guest
 * Create or get guest cart (initial session creation)
 */
router.post("/guest", controller.createOrGetGuestCart);

/**
 * GET /api/v2/cart/guest
 * Get guest cart
 */
router.get("/guest", controller.getGuestCart);

/**
 * POST /api/v2/cart/guest/items
 * Add item to guest cart
 */
router.post("/guest/items", controller.addToGuestCart);

/**
 * PUT /api/v2/cart/guest/items/:sku
 * Update guest cart item quantity
 */
router.put("/guest/items/:sku", controller.updateGuestCartItem);

/**
 * DELETE /api/v2/cart/guest/items/:sku
 * Remove item from guest cart
 */
router.delete("/guest/items/:sku", controller.removeGuestCartItem);

/**
 * DELETE /api/v2/cart/guest
 * Clear guest cart (remove all items)
 */
router.delete("/guest", controller.clearGuestCart);

// ============================================================================
// Authenticated User Cart Routes
// Requires: Authorization: Bearer <token>
// ============================================================================

/**
 * GET /api/v2/cart
 * Get user's cart
 */
router.get("/", authMiddleware, controller.getUserCart);

/**
 * POST /api/v2/cart/items
 * Add item to user's cart
 */
router.post("/items", authMiddleware, controller.addToUserCart);

/**
 * PUT /api/v2/cart/items/:sku
 * Update user cart item quantity
 */
router.put("/items/:sku", authMiddleware, controller.updateUserCartItem);

/**
 * DELETE /api/v2/cart/items/:sku
 * Remove item from user cart
 */
router.delete("/items/:sku", authMiddleware, controller.removeUserCartItem);

/**
 * DELETE /api/v2/cart
 * Clear user cart (remove all items)
 */
router.delete("/", authMiddleware, controller.clearUserCart);

// ============================================================================
// Merge Routes (Requires authentication)
// ============================================================================

/**
 * POST /api/v2/cart/merge
 * Merge guest cart into user cart
 * Session ID from cookie or body: { sessionId: string }
 */
router.post("/merge", authMiddleware, controller.mergeGuestToUserCart);

/**
 * GET /api/v2/cart/merge/preview
 * Preview merge operation
 */
router.get("/merge/preview", authMiddleware, controller.getMergePreview);

export default router;
