"use client";

import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

interface CartInitializerProps {
  isLoggedIn: boolean;
}

export default function CartInitializer({ isLoggedIn }: CartInitializerProps) {
  const items = useCartStore((state) => state.items);
  const { handleSyncCart, refetchCart } = useCart(isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      if (items && items.length > 0) {
        handleSyncCart(items);
      } else {
        refetchCart();
      }
    }
  }, [isLoggedIn]);

  return null;
}
