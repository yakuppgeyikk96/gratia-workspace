"use client";

import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

interface CartInitializerProps {
  isLoggedIn: boolean;
}

export default function CartInitializer(props: CartInitializerProps) {
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    if (props.isLoggedIn) {
      syncCart();
    }
  }, [props.isLoggedIn, syncCart]);

  return <></>;
}
