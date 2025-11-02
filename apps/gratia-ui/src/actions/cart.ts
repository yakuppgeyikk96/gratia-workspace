"use server";

import { apiClient } from "@/lib/apiClient";
import { CartResponse } from "@/types/Cart.types";
import { getAuthHeader } from "./utils";

const API_BASE_ROUTE = "/cart";

export async function getCart(): Promise<CartResponse> {
  const authHeader: Record<string, string> = await getAuthHeader();

  const response: CartResponse = await apiClient.get(API_BASE_ROUTE, {
    headers: { ...authHeader },
  });

  return response;
}
