"use server";

import {
  mockCheckoutSessionAfterShipping,
  mockCheckoutSessionInitial,
} from "@/mockData";
import {
  CheckoutSession,
  CheckoutSessionResponse,
  CreateCheckoutSessionRequest,
  UpdateShippingAddressRequest,
} from "@/types/Checkout.types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const createCheckoutSession = async (payload: CreateCheckoutSessionRequest) => {
  // TODO: Send request to backend to create checkout session

  console.log(payload);

  const cookieStore = await cookies();

  const sessionToken = mockCheckoutSessionInitial.sessionToken;

  cookieStore.set("gratia-checkout-session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 60,
    path: "/checkout",
  });

  redirect(`/checkout?step=shipping`);
};

const updateShippingAddress = async (
  request: UpdateShippingAddressRequest
): Promise<CheckoutSessionResponse> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("gratia-checkout-session")?.value;

  if (!sessionToken) {
    return {
      success: false,
      message: "No checkout session found",
      errorCode: "SESSION_NOT_FOUND",
    };
  }

  // TODO: Backend API call
  // const response = await apiClient.post(
  //   `/checkout/session/${sessionToken}/shipping`,
  //   request
  // );

  // Mock response - return updated session
  const updatedSession = {
    ...mockCheckoutSessionAfterShipping,
    shippingAddress: request.shippingAddress,
    billingAddress: request.billingIsSameAsShipping
      ? request.shippingAddress
      : request.billingAddress,
  };

  return {
    success: true,
    message: "Shipping address updated successfully",
    data: updatedSession as CheckoutSession,
  };
};

const getCheckoutSessionFromCookie =
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

    // TODO: Backend API call
    // const response = await apiClient.get(`/checkout/session/${sessionToken}`);

    // Mock response - şimdilik initial session döndür
    return {
      success: true,
      message: "Session retrieved successfully",
      data: mockCheckoutSessionInitial,
    };
  };

export {
  createCheckoutSession,
  getCheckoutSessionFromCookie,
  updateShippingAddress,
};
