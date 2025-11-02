"use client";

import { useCartStore } from "@/store/cartStore";
import CartItemComponent from "./CartItem";

export default function CartList() {
  const cartItems = useCartStore((state) => state.items);

  return (
    <div>
      {cartItems.map((item) => (
        <CartItemComponent key={item.sku} item={item} />
      ))}
    </div>
  );
}
