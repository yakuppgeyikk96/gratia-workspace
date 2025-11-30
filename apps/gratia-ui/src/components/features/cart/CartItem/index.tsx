"use client";

import QuantitySelector from "@/components/common/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import { CartItem as CartItemType } from "@/types/Cart.types";
import { memo, useCallback } from "react";
import styles from "./CartItem.module.scss";
import CartItemContent from "./CartItemContent";
import CartItemImage from "./CartItemImage";
import CartItemRemoveButton from "./CartItemRemoveButton";

interface CartItemProps {
  item: CartItemType;
  isLoggedIn?: boolean;
}

function CartItem({ item, isLoggedIn = false }: CartItemProps) {
  const { handleUpdateQuantity } = useCart(isLoggedIn);

  const totalPrice = item.discountedPrice
    ? item.discountedPrice * item.quantity
    : item.price * item.quantity;

  const handleIncrement = useCallback(() => {
    handleUpdateQuantity(item.sku, item.quantity + 1);
  }, [item.sku, item.quantity, isLoggedIn, handleUpdateQuantity]);

  const handleDecrement = useCallback(() => {
    handleUpdateQuantity(item.sku, item.quantity - 1);
  }, [item.sku, item.quantity, isLoggedIn, handleUpdateQuantity]);

  const handleRemove = () => {
    handleUpdateQuantity(item.sku, 0);
  };

  return (
    <div className={styles.cartItem}>
      <CartItemImage
        images={item.productImages}
        productName={item.productName}
      />

      <CartItemContent
        productName={item.productName}
        quantity={item.quantity}
        totalPrice={totalPrice}
        price={item.price}
        discountedPrice={item.discountedPrice}
      />

      <CartItemRemoveButton
        onRemove={handleRemove}
        ariaLabel={`Remove ${item.productName} from cart`}
      />

      <div className={styles.quantitySection}>
        <QuantitySelector
          quantity={item.quantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          min={1}
          size="md"
        />
      </div>
    </div>
  );
}

export default memo(CartItem);
