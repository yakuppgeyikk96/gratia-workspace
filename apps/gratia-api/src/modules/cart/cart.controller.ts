import type { NextFunction, Request, Response } from "express";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { CART_COOKIES, CART_MESSAGES } from "./cart.constants";
import {
  addToCartSchema,
  mergeCartSchema,
  skuParamSchema,
  updateCartItemSchema,
} from "./cart.schema";
import * as cartMergeService from "./services/cart-merge.service";
import * as guestCartService from "./services/guest-cart.service";
import * as userCartService from "./services/user-cart.service";

// ============================================================================
// Cart Controller
// ============================================================================

// Type for authenticated request
interface AuthenticatedRequest extends Request {
  // Set by `authMiddleware` from JWT payload (`JwtPayload`)
  user?: { userId: string; email: string };
}

// ============================================================================
// Guest Cart Controllers
// ============================================================================

/**
 * GET /api/v2/cart/guest
 * Get guest cart by session ID
 */
export const getGuestCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionId = getSessionIdFromRequest(req);

    if (!sessionId) {
      // No session - return empty response with new session ID
      const newSessionId = guestCartService.generateSessionId();
      setSessionCookie(res, newSessionId);

      res.json({
        success: true,
        message: CART_MESSAGES.CART_CREATED,
        data: {
          sessionId: newSessionId,
          cart: await guestCartService.getOrCreateGuestCart(newSessionId),
        },
      });
      return;
    }

    const cart = await guestCartService.getGuestCart(sessionId);

    if (!cart) {
      // Session expired or invalid - create new cart
      const cart = await guestCartService.getOrCreateGuestCart(sessionId);
      res.json({
        success: true,
        message: CART_MESSAGES.CART_RETRIEVED,
        data: { sessionId, cart },
      });
      return;
    }

    res.json({
      success: true,
      message: CART_MESSAGES.CART_RETRIEVED,
      data: { sessionId, cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v2/cart/guest
 * Create or get guest cart (also used for initial session creation)
 */
export const createOrGetGuestCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let sessionId = getSessionIdFromRequest(req);

    if (!sessionId) {
      sessionId = guestCartService.generateSessionId();
      setSessionCookie(res, sessionId);
    }

    const cart = await guestCartService.getOrCreateGuestCart(sessionId);

    res.json({
      success: true,
      message: CART_MESSAGES.CART_CREATED,
      data: { sessionId, cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v2/cart/guest/items
 * Add item to guest cart
 */
export const addToGuestCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let sessionId = getSessionIdFromRequest(req);

    if (!sessionId) {
      sessionId = guestCartService.generateSessionId();
      setSessionCookie(res, sessionId);
    }

    const validatedBody = addToCartSchema.parse(req.body);
    const cart = await guestCartService.addToGuestCart(
      sessionId,
      validatedBody,
    );

    res.status(201).json({
      success: true,
      message: CART_MESSAGES.ITEM_ADDED,
      data: { sessionId, cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v2/cart/guest/items/:sku
 * Update guest cart item quantity
 */
export const updateGuestCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionId = getSessionIdFromRequest(req);

    if (!sessionId) {
      throw new AppError(
        CART_MESSAGES.INVALID_SESSION,
        ErrorCode.UNAUTHORIZED,
      );
    }

    const { sku } = skuParamSchema.parse(req.params);
    const validatedBody = updateCartItemSchema.parse(req.body);

    const cart = await guestCartService.updateGuestCartItem(
      sessionId,
      sku,
      validatedBody,
    );

    res.json({
      success: true,
      message: CART_MESSAGES.ITEM_UPDATED,
      data: { sessionId, cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v2/cart/guest/items/:sku
 * Remove item from guest cart
 */
export const removeGuestCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionId = getSessionIdFromRequest(req);

    if (!sessionId) {
      throw new AppError(
        CART_MESSAGES.INVALID_SESSION,
        ErrorCode.UNAUTHORIZED,
      );
    }

    const { sku } = skuParamSchema.parse(req.params);
    const cart = await guestCartService.removeFromGuestCart(sessionId, sku);

    res.json({
      success: true,
      message: CART_MESSAGES.ITEM_REMOVED,
      data: { sessionId, cart },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v2/cart/guest
 * Clear guest cart
 */
export const clearGuestCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionId = getSessionIdFromRequest(req);

    if (!sessionId) {
      throw new AppError(
        CART_MESSAGES.INVALID_SESSION,
        ErrorCode.UNAUTHORIZED,
      );
    }

    const cart = await guestCartService.clearGuestCart(sessionId);

    res.json({
      success: true,
      message: CART_MESSAGES.CART_CLEARED,
      data: { sessionId, cart },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// User Cart Controllers (Authenticated)
// ============================================================================

/**
 * GET /api/v2/cart
 * Get authenticated user's cart
 */
export const getUserCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const cart = await userCartService.getUserCart(userId);

    res.json({
      success: true,
      message: CART_MESSAGES.CART_RETRIEVED,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v2/cart/items
 * Add item to user's cart
 */
export const addToUserCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const validatedBody = addToCartSchema.parse(req.body);

    const cart = await userCartService.addToUserCart(userId, validatedBody);

    res.status(201).json({
      success: true,
      message: CART_MESSAGES.ITEM_ADDED,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v2/cart/items/:sku
 * Update user cart item quantity
 */
export const updateUserCartItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const { sku } = skuParamSchema.parse(req.params);
    const validatedBody = updateCartItemSchema.parse(req.body);

    const cart = await userCartService.updateUserCartItem(
      userId,
      sku,
      validatedBody,
    );

    res.json({
      success: true,
      message: CART_MESSAGES.ITEM_UPDATED,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v2/cart/items/:sku
 * Remove item from user cart
 */
export const removeUserCartItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const { sku } = skuParamSchema.parse(req.params);

    const cart = await userCartService.removeFromUserCart(userId, sku);

    res.json({
      success: true,
      message: CART_MESSAGES.ITEM_REMOVED,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v2/cart
 * Clear user cart
 */
export const clearUserCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const cart = await userCartService.clearUserCart(userId);

    res.json({
      success: true,
      message: CART_MESSAGES.CART_CLEARED,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// Merge Controller
// ============================================================================

/**
 * POST /api/v2/cart/merge
 * Merge guest cart into user cart
 */
export const mergeGuestToUserCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = requireUserId(req);

    // Get session ID from cookie or body
    let sessionId = getSessionIdFromRequest(req);

    // Also check body for sessionId (for explicit merge requests)
    if (!sessionId && req.body?.sessionId) {
      const validated = mergeCartSchema.safeParse(req.body);
      if (validated.success) {
        sessionId = validated.data.sessionId;
      }
    }

    if (!sessionId) {
      // No guest cart to merge - just return user cart
      const cart = await userCartService.getUserCart(userId);
      res.json({
        success: true,
        message: CART_MESSAGES.CART_MERGED,
        data: {
          cart,
          merged: { added: [], updated: [], skipped: [] },
          guestCartCleared: true,
        },
      });
      return;
    }

    const result = await cartMergeService.mergeGuestToUserCart(
      userId,
      sessionId,
    );

    // Clear session cookie after merge
    clearSessionCookie(res);

    res.json({
      success: true,
      message: CART_MESSAGES.CART_MERGED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v2/cart/merge/preview
 * Preview merge operation (what will happen)
 */
export const getMergePreview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = requireUserId(req);
    const sessionId = getSessionIdFromRequest(req);

    if (!sessionId) {
      res.json({
        success: true,
        data: {
          guestItemCount: 0,
          userItemCount: 0,
          willAdd: 0,
          willUpdate: 0,
          willSkip: 0,
        },
      });
      return;
    }

    const preview = await cartMergeService.getMergePreview(userId, sessionId);

    res.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get session ID from cookie or header
 */
const getSessionIdFromRequest = (req: Request): string | undefined => {
  // Check cookie first
  const cookieSessionId = req.cookies?.[CART_COOKIES.SESSION_ID];
  if (cookieSessionId && typeof cookieSessionId === "string") {
    return cookieSessionId;
  }

  // Check header as fallback (for API clients)
  const headerSessionId = req.headers["x-cart-session-id"];
  if (headerSessionId && typeof headerSessionId === "string") {
    return headerSessionId;
  }

  return undefined;
};

/**
 * Set session cookie
 */
const setSessionCookie = (res: Response, sessionId: string): void => {
  res.cookie(CART_COOKIES.SESSION_ID, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

/**
 * Clear session cookie
 */
const clearSessionCookie = (res: Response): void => {
  res.clearCookie(CART_COOKIES.SESSION_ID, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

/**
 * Get user ID from authenticated request (throws if not authenticated)
 */
const requireUserId = (req: AuthenticatedRequest): number => {
  if (!req.user?.userId) {
    console.log("Authentication required - no user ID found in request");
    throw new AppError("Authentication required", ErrorCode.UNAUTHORIZED);
  }
  return parseInt(req.user.userId, 10);
};
