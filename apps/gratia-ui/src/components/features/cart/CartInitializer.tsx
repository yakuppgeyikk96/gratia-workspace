"use client";

import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

interface CartInitializerProps {
  isLoggedIn: boolean;
}

export default function CartInitializer(props: CartInitializerProps) {
  const syncCart = useCartStore((state) => state.syncCart);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (props.isLoggedIn) {
      syncCart();
    }

    if (items === null) {
      clearCart();
    }
  }, [props.isLoggedIn, syncCart, items, clearCart]);

  return <></>;
}
