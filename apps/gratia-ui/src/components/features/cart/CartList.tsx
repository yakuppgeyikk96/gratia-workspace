"use client";

import { CartItem } from "@/types/Cart.types";
import Flex from "@gratia/ui/components/Flex";
import CartItemComponent from "./CartItem";

interface CartListProps {
  cartItems: CartItem[];
  isLoggedIn: boolean;
}

export default function CartList({ cartItems, isLoggedIn }: CartListProps) {
  return (
    <Flex direction="column" gap={12}>
      {cartItems.map((item) => (
        <CartItemComponent key={item.sku} item={item} isLoggedIn={isLoggedIn} />
      ))}
    </Flex>
  );
}
