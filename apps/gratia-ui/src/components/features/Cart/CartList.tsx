"use client";

import { useCartStore } from "@/store/cartStore";
import { Cart, CartItem } from "@/types/Cart.types";
import { useCallback, useEffect } from "react";
import CartItemComponent from "./CartItem";

interface CartListProps {
  cart: Cart | null;
}

export default function CartList({ cart }: CartListProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const addCartItems = useCallback(
    (items: CartItem[]) => {
      items.forEach((item) => {
        addItem(item);
      });
    },
    [addItem]
  );

  useEffect(() => {
    if (cart) {
      addCartItems(cart.items);
    }
  }, [cart, addCartItems]);

  return (
    <div>
      {cartItems.map((item) => (
        <CartItemComponent key={item.sku} item={item} />
      ))}
    </div>
  );
}
