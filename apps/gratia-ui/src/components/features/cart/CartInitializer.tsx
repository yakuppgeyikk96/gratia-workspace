"use client";

import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";

interface CartInitializerProps {
  isLoggedIn: boolean;
}

export default function CartInitializer(props: CartInitializerProps) {
  const { handleSyncCart } = useCart(props.isLoggedIn);

  useEffect(() => {
    if (props.isLoggedIn) {
      handleSyncCart();
    }
  }, [props.isLoggedIn, handleSyncCart]);

  return <></>;
}
