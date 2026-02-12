import { CartData, GuestCartData } from "@/types/Cart.types";

export const CART_QUERY_KEY = "cart";
export const TOAST_DURATION = 3000;

export function extractCartPayload(
  isLoggedIn: boolean,
  data: CartData | GuestCartData,
): { cart: CartData; sessionId?: string } {
  if (isLoggedIn) {
    return { cart: data as CartData };
  }
  const guest = data as GuestCartData;
  return { cart: guest.cart, sessionId: guest.sessionId };
}
