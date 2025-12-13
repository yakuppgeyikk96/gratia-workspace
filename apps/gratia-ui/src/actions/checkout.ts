"use server";

import { apiClient } from "@/lib/apiClient";
import { ShippingMethodResponse } from "@/types";
import { IApiResponse } from "@/types/Api.types";
import {
  CheckoutSession,
  CheckoutSessionResponse,
  CreateCheckoutSessionRequest,
  CreateSessionResponse,
  SelectShippingMethodRequest,
  UpdateShippingAddressRequest,
} from "@/types/Checkout.types";
import { ICity, ICountry, IState } from "@/types/Location.types";
import { cookies } from "next/headers";
import { cache } from "react";

const API_BASE_ROUTE = "/checkout";

const createCheckoutSession = async (
  payload: CreateCheckoutSessionRequest
): Promise<CreateSessionResponse> => {
  const cookieStore = await cookies();

  const response: CreateSessionResponse = await apiClient.post(
    `${API_BASE_ROUTE}/session`,
    payload
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
    `${API_BASE_ROUTE}/session/${sessionToken}/shipping`,
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
      const response: CheckoutSessionResponse = await apiClient.get(
        `${API_BASE_ROUTE}/session/${sessionToken}`
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

const getAvailableCountriesForShipping = async (): Promise<
  IApiResponse<ICountry[]>
> => {
  return await apiClient.get(`${API_BASE_ROUTE}/shipping-country-options`);
};

const getAvailableStatesForShipping = async (
  countryCode: string
): Promise<IApiResponse<IState[]>> => {
  return await apiClient.get(
    `${API_BASE_ROUTE}/shipping-states-options/${countryCode}`
  );
};

const getAvailableCitiesForShipping = async (
  countryCode: string,
  stateCode: string
): Promise<IApiResponse<ICity[]>> => {
  return await apiClient.get(
    `${API_BASE_ROUTE}/shipping-cities-options/${countryCode}/${stateCode}`
  );
};

const getAvailableShippingMethods = cache(
  async (): Promise<ShippingMethodResponse> => {
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
      const response: ShippingMethodResponse = await apiClient.get(
        `${API_BASE_ROUTE}/session/${sessionToken}/shipping-methods`
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

const selectShippingMethod = async (
  request: SelectShippingMethodRequest
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
    `${API_BASE_ROUTE}/session/${sessionToken}/shipping-method`,
    request
  );
};

export {
  createCheckoutSession,
  getAvailableCitiesForShipping,
  getAvailableCountriesForShipping,
  getAvailableShippingMethods,
  getAvailableStatesForShipping,
  getCheckoutSessionData,
  selectShippingMethod,
  updateShippingAddress,
};
