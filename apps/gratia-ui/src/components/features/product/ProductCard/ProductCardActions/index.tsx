"use client";

import QuantitySelector from "@/components/common/QuantitySelector";
import { useCartStore } from "@/store/cartStore";
import { IconButton } from "@gratia/ui/components";
import { IconShoppingBag } from "@gratia/ui/icons";
import classNames from "classnames";
import { ProductCardActionsProps } from "../ProductCard.types";
import styles from "./ProductCardActions.module.scss";

export default function ProductCardActions({
  price,
  discountedPrice,
  productSku,
  isLoggedIn,
  onAddToCart,
}: ProductCardActionsProps) {
  const hasDiscount = discountedPrice !== undefined && discountedPrice < price;
  const displayPrice = hasDiscount ? discountedPrice : price;

  const itemCount = useCartStore((state) => state.getItemCount(productSku));
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isInCart = itemCount > 0;

  const handleAddToCart = () => {
    onAddToCart?.();
  };

  const handleIncrement = () => {
    updateQuantity(productSku, itemCount + 1, isLoggedIn);
  };

  const handleDecrement = () => {
    updateQuantity(productSku, itemCount - 1, isLoggedIn);
  };

  return (
    <div className={styles.actionsContainer}>
      {/* Price Section */}
      <div className={styles.priceSection}>
        <span className={styles.currentPrice}>${displayPrice.toFixed(2)}</span>
        {hasDiscount && (
          <span className={styles.originalPrice}>${price.toFixed(2)}</span>
        )}
      </div>

      <div
        className={classNames(styles.addToCartButton, {
          [styles.inCart]: isInCart,
        })}
      >
        {isInCart ? (
          <QuantitySelector
            quantity={itemCount}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            min={0}
            size="md"
          />
        ) : (
          <IconButton
            icon={<IconShoppingBag />}
            size="md"
            onClick={handleAddToCart}
            ariaLabel="Add to cart"
          />
        )}
      </div>
    </div>
  );
}
