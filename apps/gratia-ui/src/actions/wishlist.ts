"use server";

import { apiClient } from "@/lib/apiClient";
import type {
  Wishlist,
  WishlistAddPayload,
  WishlistAddResponse,
  WishlistAddResult,
  WishlistCheckResponse,
  WishlistCheckResult,
  WishlistCountResponse,
  WishlistCountResult,
  WishlistRemoveResponse,
  WishlistResponse,
} from "@/types/Wishlist.types";
import { getAuthHeader } from "./utils";

const API_BASE_ROUTE = "/wishlist";

export async function getWishlist(): Promise<WishlistResponse> {
  const authHeader = await getAuthHeader();

  return await apiClient.get<Wishlist>(API_BASE_ROUTE, {
    headers: authHeader,
  });
}

export async function getWishlistCount(): Promise<WishlistCountResponse> {
  const authHeader = await getAuthHeader();

  return await apiClient.get<WishlistCountResult>(`${API_BASE_ROUTE}/count`, {
    headers: authHeader,
  });
}

export async function checkWishlistProductIds(
  productIds: number[],
): Promise<WishlistCheckResponse> {
  const authHeader = await getAuthHeader();
  const query = productIds.join(",");

  return await apiClient.get<WishlistCheckResult>(
    `${API_BASE_ROUTE}/check?productIds=${encodeURIComponent(query)}`,
    { headers: authHeader },
  );
}

export async function addToWishlist(
  payload: WishlistAddPayload,
): Promise<WishlistAddResponse> {
  const authHeader = await getAuthHeader();

  return await apiClient.post<WishlistAddResult>(API_BASE_ROUTE, payload, {
    headers: authHeader,
  });
}

export async function removeFromWishlist(
  productId: number,
): Promise<WishlistRemoveResponse> {
  const authHeader = await getAuthHeader();

  return await apiClient.delete<null>(`${API_BASE_ROUTE}/${productId}`, {
    headers: authHeader,
  });
}
