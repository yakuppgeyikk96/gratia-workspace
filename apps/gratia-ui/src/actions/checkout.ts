"use server";

import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import {
  CheckoutSession,
  CheckoutSessionResponse,
  CreateCheckoutSessionRequest,
  CreateSessionResponse,
  UpdateShippingAddressRequest,
} from "@/types/Checkout.types";
import { cookies } from "next/headers";
import { cache } from "react";
import { getAuthHeader } from "./utils";

const createCheckoutSession = async (
  payload: CreateCheckoutSessionRequest
): Promise<CreateSessionResponse> => {
  const cookieStore = await cookies();
  const authHeader: Record<string, string> = await getAuthHeader();

  const response: CreateSessionResponse = await apiClient.post(
    `/checkout/session`,
    payload,
    {
      headers: { ...authHeader },
    }
  );

  if (response.success && response.data?.sessionToken) {
    const sessionToken = response.data.sessionToken;

    cookieStore.set("gratia-checkout-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 20 * 60,
      path: "/checkout",
    });
  }

  return response;
};

const updateShippingAddress = async (
  request: UpdateShippingAddressRequest
): Promise<IApiResponse<CheckoutSession>> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("gratia-checkout-session")?.value;

  if (!sessionToken) {
    return {
      success: false,
      message: "No checkout session found",
      errorCode: "SESSION_NOT_FOUND",
    };
  }

  return await apiClient.put(
    `/checkout/session/${sessionToken}/shipping`,
    request
  );
};

const getCheckoutSessionData = cache(
  async (): Promise<CheckoutSessionResponse> => {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("gratia-checkout-session")?.value;

    if (!sessionToken) {
      return {
        success: false,
        message: "No checkout session found",
        errorCode: "SESSION_NOT_FOUND",
      };
    }

    try {
      const authHeader: Record<string, string> = await getAuthHeader();

      const response: CheckoutSessionResponse = await apiClient.get(
        `/checkout/session/${sessionToken}`,
        {
          headers: { ...authHeader },
        }
      );

      return response;
    } catch (error) {
      console.error("Error fetching checkout session:", error);
      return {
        success: false,
        message: "Failed to retrieve checkout session",
        errorCode: "FETCH_ERROR",
      };
    }
  }
);

export { createCheckoutSession, getCheckoutSessionData, updateShippingAddress };
