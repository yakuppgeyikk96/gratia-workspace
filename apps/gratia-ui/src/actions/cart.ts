"use server";

import { apiClient } from "@/lib/apiClient";
import {
  AddToCartDto,
  CartResponse,
  CartSyncResponse,
  SyncCartDto,
  UpdateCartItemDto,
} from "@/types/Cart.types";
import { getAuthHeader } from "./utils";

const API_BASE_ROUTE = "/cart";

export async function getCart(): Promise<CartResponse> {
  const authHeader: Record<string, string> = await getAuthHeader();

  const response: CartResponse = await apiClient.get(API_BASE_ROUTE, {
    headers: { ...authHeader },
  });

  return response;
}

export async function addToCart(dto: AddToCartDto): Promise<CartResponse> {
  const authHeader: Record<string, string> = await getAuthHeader();

  const response: CartResponse = await apiClient.post(API_BASE_ROUTE, dto, {
    headers: { ...authHeader },
  });

  return response;
}

export async function updateCartItem(
  dto: UpdateCartItemDto,
): Promise<CartResponse> {
  const authHeader: Record<string, string> = await getAuthHeader();

  const response: CartResponse = await apiClient.put(API_BASE_ROUTE, dto, {
    headers: { ...authHeader },
  });

  return response;
}

export async function syncCart(dto: SyncCartDto): Promise<CartSyncResponse> {
  const authHeader: Record<string, string> = await getAuthHeader();

  const response: CartSyncResponse = await apiClient.post(
    API_BASE_ROUTE + "/sync",
    dto,
    {
      headers: { ...authHeader },
    },
  );

  return response;
}
