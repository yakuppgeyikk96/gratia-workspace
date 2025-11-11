"use client";

import { useCartStore } from "@/store/cartStore";
import { IconButton } from "@gratia/ui/components";
import { IconDash, IconPlus, IconShoppingBag } from "@gratia/ui/icons";
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

  const handleUpdateQuantity = (quantity: number) => {
    updateQuantity(productSku, quantity, isLoggedIn);
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

      {/* Add to Cart Button */}
      <div
        className={classNames(styles.addToCartButton, {
          [styles.inCart]: isInCart,
        })}
      >
        {isInCart ? (
          <div className={styles.inCartIcon}>
            <div
              role="button"
              tabIndex={0}
              className={classNames(
                styles.inCartIconButton,
                styles.inCartDashIconButton
              )}
              onClick={() => handleUpdateQuantity(itemCount - 1)}
              aria-label="Decrement quantity"
            >
              <IconDash />
            </div>
            <span className={styles.inCartCount}>{itemCount}</span>
            <div
              role="button"
              tabIndex={0}
              className={classNames(
                styles.inCartIconButton,
                styles.inCartPlusIconButton
              )}
              onClick={() => handleUpdateQuantity(itemCount + 1)}
              aria-label="Increment quantity"
            >
              <IconPlus />
            </div>
          </div>
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
