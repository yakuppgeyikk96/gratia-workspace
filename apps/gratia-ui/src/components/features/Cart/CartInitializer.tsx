"use client";

import { getCart } from "@/actions";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useRef } from "react";

export default function CartInitializer() {
  const addItems = useCartStore((state) => state.addItems);
  const setDataLoading = useCartStore((state) => state.setDataLoading);
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      setDataLoading(true);

      getCart()
        .then((cartResponse) => {
          if (cartResponse.success) {
            addItems(cartResponse.data?.items ?? []);
          }
        })
        .finally(() => {
          setDataLoading(false);
        });
    };
    fetchCart();
  }, []);

  return <></>;
}
