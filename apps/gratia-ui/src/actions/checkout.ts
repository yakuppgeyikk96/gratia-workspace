"use server";

import { mockCheckoutSessionInitial } from "@/mockData";
import { CreateCheckoutSessionRequest } from "@/types/Checkout.types";
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

export { createCheckoutSession };
