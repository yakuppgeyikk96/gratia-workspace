"use server";

import { apiClient } from "@/lib/apiClient";
import {
  AddToCartDto,
  CartMergeResponse,
  CartResponse,
  GuestCartResponse,
  MergeCartDto,
  UpdateCartItemDto,
} from "@/types/Cart.types";
import { getAuthHeader } from "./utils";

// ============================================================================
// API Base Routes
// ============================================================================

const API_CART = "/cart";
const CART_SESSION_HEADER = "x-cart-session-id";

// ============================================================================
// Guest Cart Actions
// ============================================================================

/**
 * Create or get guest cart
 * POST /cart/guest
 */
export async function createOrGetGuestCart(
  sessionId?: string
): Promise<GuestCartResponse> {
  const headers: Record<string, string> = {};

  if (sessionId) {
    headers[CART_SESSION_HEADER] = sessionId;
  }

  const response: GuestCartResponse = await apiClient.post(
    `${API_CART}/guest`,
    {},
    { headers }
  );

  return response;
}

/**
 * Get guest cart
 * GET /cart/guest
 */
export async function getGuestCart(
  sessionId: string
): Promise<GuestCartResponse> {
  const response: GuestCartResponse = await apiClient.get(
    `${API_CART}/guest`,
    {
      headers: {
        [CART_SESSION_HEADER]: sessionId,
      },
    }
  );

  return response;
}

/**
 * Add item to guest cart
 * POST /cart/guest/items
 */
export async function addToGuestCart(
  sessionId: string,
  dto: AddToCartDto
): Promise<GuestCartResponse> {
  const response: GuestCartResponse = await apiClient.post(
    `${API_CART}/guest/items`,
    dto,
    {
      headers: {
        [CART_SESSION_HEADER]: sessionId,
      },
    }
  );

  return response;
}

/**
 * Update guest cart item quantity
 * PUT /cart/guest/items/:sku
 */
export async function updateGuestCartItem(
  sessionId: string,
  sku: string,
  dto: UpdateCartItemDto
): Promise<GuestCartResponse> {
  const response: GuestCartResponse = await apiClient.put(
    `${API_CART}/guest/items/${encodeURIComponent(sku)}`,
    dto,
    {
      headers: {
        [CART_SESSION_HEADER]: sessionId,
      },
    }
  );

  return response;
}

/**
 * Remove item from guest cart
 * DELETE /cart/guest/items/:sku
 */
export async function removeGuestCartItem(
  sessionId: string,
  sku: string
): Promise<GuestCartResponse> {
  const response: GuestCartResponse = await apiClient.delete(
    `${API_CART}/guest/items/${encodeURIComponent(sku)}`,
    {
      headers: {
        [CART_SESSION_HEADER]: sessionId,
      },
    }
  );

  return response;
}

/**
 * Clear guest cart
 * DELETE /cart/guest
 */
export async function clearGuestCart(
  sessionId: string
): Promise<GuestCartResponse> {
  const response: GuestCartResponse = await apiClient.delete(
    `${API_CART}/guest`,
    {
      headers: {
        [CART_SESSION_HEADER]: sessionId,
      },
    }
  );

  return response;
}

// ============================================================================
// User Cart Actions (Authenticated)
// ============================================================================

/**
 * Get user cart
 * GET /cart
 */
export async function getUserCart(): Promise<CartResponse> {
  const authHeader = await getAuthHeader();

  const response: CartResponse = await apiClient.get(API_CART, {
    headers: { ...authHeader },
  });

  return response;
}

/**
 * Add item to user cart
 * POST /cart/items
 */
export async function addToUserCart(
  dto: AddToCartDto
): Promise<CartResponse> {
  const authHeader = await getAuthHeader();

  const response: CartResponse = await apiClient.post(
    `${API_CART}/items`,
    dto,
    {
      headers: { ...authHeader },
    }
  );

  return response;
}

/**
 * Update user cart item quantity
 * PUT /cart/items/:sku
 */
export async function updateUserCartItem(
  sku: string,
  dto: UpdateCartItemDto
): Promise<CartResponse> {
  const authHeader = await getAuthHeader();

  const response: CartResponse = await apiClient.put(
    `${API_CART}/items/${encodeURIComponent(sku)}`,
    dto,
    {
      headers: { ...authHeader },
    }
  );

  return response;
}

/**
 * Remove item from user cart
 * DELETE /cart/items/:sku
 */
export async function removeUserCartItem(sku: string): Promise<CartResponse> {
  const authHeader = await getAuthHeader();

  const response: CartResponse = await apiClient.delete(
    `${API_CART}/items/${encodeURIComponent(sku)}`,
    {
      headers: { ...authHeader },
    }
  );

  return response;
}

/**
 * Clear user cart
 * DELETE /cart
 */
export async function clearUserCart(): Promise<CartResponse> {
  const authHeader = await getAuthHeader();

  const response: CartResponse = await apiClient.delete(API_CART, {
    headers: { ...authHeader },
  });

  return response;
}

// ============================================================================
// Cart Merge Actions
// ============================================================================

/**
 * Merge guest cart to user cart
 * POST /cart/merge
 */
export async function mergeGuestToUserCart(
  dto: MergeCartDto
): Promise<CartMergeResponse> {
  const authHeader = await getAuthHeader();

  const response: CartMergeResponse = await apiClient.post(
    `${API_CART}/merge`,
    dto,
    {
      headers: { ...authHeader },
    }
  );

  return response;
}

/**
 * Get merge preview (without actually merging)
 * GET /cart/merge/preview
 */
export async function getMergePreview(
  sessionId: string
): Promise<CartMergeResponse> {
  const authHeader = await getAuthHeader();

  const response: CartMergeResponse = await apiClient.get(
    `${API_CART}/merge/preview`,
    {
      headers: {
        ...authHeader,
        "x-session-id": sessionId,
      },
    }
  );

  return response;
}