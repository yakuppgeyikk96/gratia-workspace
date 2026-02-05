"use server";

import { apiClient } from "@/lib/apiClient";
import type {
  Order,
  OrderResponse,
  PaginatedOrders,
  PaginatedOrdersResponse,
  RequestOrderAccessRequest,
  RequestOrderAccessResponseType,
  VerifyOrderAccessRequest,
  VerifyOrderAccessResponse,
  VerifyOrderAccessResponseType,
} from "@/types/Order.types";
import { cookies } from "next/headers";
import { getAuthHeader } from "./utils";

const API_BASE_ROUTE = "/orders";

export async function getUserOrders(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedOrdersResponse> {
  const authHeader = await getAuthHeader();

  return await apiClient.get<PaginatedOrders>(
    `${API_BASE_ROUTE}/my-orders?page=${page}&limit=${limit}`,
    { headers: authHeader }
  );
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderResponse> {
  const cookieStore = await cookies();
  const authHeader = await getAuthHeader();

  const orderAccessToken = cookieStore.get("gratia-order-access")?.value;

  const headers: Record<string, string> = {
    ...authHeader,
    ...(orderAccessToken ? { "x-order-access-token": orderAccessToken } : {}),
  };

  return await apiClient.get<Order>(`${API_BASE_ROUTE}/${orderNumber}`, { headers });
}

export async function requestOrderAccess(
  orderNumber: string,
  payload: RequestOrderAccessRequest
): Promise<RequestOrderAccessResponseType> {
  return await apiClient.post(`${API_BASE_ROUTE}/${orderNumber}/request-access`, payload);
}

export async function verifyOrderAccess(
  orderNumber: string,
  payload: VerifyOrderAccessRequest
): Promise<VerifyOrderAccessResponseType> {
  const cookieStore = await cookies();

  const response = await apiClient.post<VerifyOrderAccessResponse>(
    `${API_BASE_ROUTE}/${orderNumber}/verify-access`,
    payload
  );

  if (response.success && response.data?.orderAccessToken) {
    cookieStore.set("gratia-order-access", response.data.orderAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/orders",
    });
  }

  return response;
}

