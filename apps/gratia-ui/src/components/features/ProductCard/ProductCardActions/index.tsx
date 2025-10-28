"use client";

import { IconButton } from "@gratia/ui/components";
import { IconShoppingBag } from "@gratia/ui/icons";
import { ProductCardActionsProps } from "../ProductCard.types";
import styles from "./ProductCardActions.module.scss";

export default function ProductCardActions({
  price,
  discountedPrice,
  onAddToCart,
}: ProductCardActionsProps) {
  const hasDiscount = discountedPrice !== undefined && discountedPrice < price;
  const displayPrice = hasDiscount ? discountedPrice : price;

  const handleAddToCart = () => {
    onAddToCart?.();
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
      <div className={styles.addToCartButton}>
        <IconButton
          icon={<IconShoppingBag size={18} />}
          size="md"
          onClick={handleAddToCart}
          ariaLabel="Add to cart"
        />
      </div>
    </div>
  );
}
