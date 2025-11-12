"use client";

import QuantitySelector from "@/components/common/QuantitySelector";
import { useCartStore } from "@/store/cartStore";
import { CartItem as CartItemType } from "@/types/Cart.types";
import styles from "./CartItem.module.scss";
import CartItemContent from "./CartItemContent";
import CartItemImage from "./CartItemImage";
import CartItemRemoveButton from "./CartItemRemoveButton";

interface CartItemProps {
  item: CartItemType;
  isLoggedIn?: boolean;
}

export default function CartItem({ item, isLoggedIn = false }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const totalPrice = item.discountedPrice
    ? item.discountedPrice * item.quantity
    : item.price * item.quantity;

  const handleIncrement = () => {
    updateQuantity(item.sku, item.quantity + 1, isLoggedIn);
  };

  const handleDecrement = () => {
    updateQuantity(item.sku, item.quantity - 1, isLoggedIn);
  };

  const handleRemove = () => {
    updateQuantity(item.sku, 0, isLoggedIn);
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
