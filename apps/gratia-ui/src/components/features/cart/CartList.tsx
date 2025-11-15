"use client";

import { useCartStore } from "@/store/cartStore";
import { Flex } from "@gratia/ui/components";
import CartItemComponent from "./CartItem";

export default function CartList({ isLoggedIn }: { isLoggedIn: boolean }) {
  const cartItems = useCartStore((state) => state.items);

  return (
    <Flex direction="column" gap={12}>
      {cartItems.map((item) => (
        <CartItemComponent key={item.sku} item={item} isLoggedIn={isLoggedIn} />
      ))}
    </Flex>
  );
}
