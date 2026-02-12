"use client";

import { getGuestCart, getUserCart } from "@/actions/cart";
import { useCartStore } from "@/store/cartStore";
import { CartData, GuestCartData } from "@/types/Cart.types";
import { useQuery } from "@tanstack/react-query";
import { CART_QUERY_KEY, extractCartPayload } from "./cart-utils";

export function useCartQuery(isLoggedIn: boolean) {
  const sessionId = useCartStore((state) => state.sessionId);
  const getOrCreateSessionId = useCartStore(
    (state) => state.getOrCreateSessionId,
  );
  const setCartData = useCartStore((state) => state.setCartData);
  const setLoading = useCartStore((state) => state.setLoading);
  const setSessionId = useCartStore((state) => state.setSessionId);

  const {
    data: cartData,
    refetch: refetchCart,
    isLoading,
  } = useQuery({
    queryKey: isLoggedIn
      ? [CART_QUERY_KEY, true]
      : [CART_QUERY_KEY, false, sessionId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = isLoggedIn
          ? await getUserCart()
          : await getGuestCart(getOrCreateSessionId());

        if (response.success && response.data) {
          const { cart, sessionId: returnedSessionId } = extractCartPayload(
            isLoggedIn,
            response.data as CartData | GuestCartData,
          );

          if (
            !isLoggedIn &&
            returnedSessionId &&
            returnedSessionId !== sessionId
          ) {
            setSessionId(returnedSessionId);
          }

          setCartData({
            items: cart.items,
            summary: cart.summary,
            warnings: cart.warnings,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
          });
          return cart;
        }

        return null;
      } catch (error) {
        console.error("Fetch cart error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { cartData, refetchCart, isLoading };
}
