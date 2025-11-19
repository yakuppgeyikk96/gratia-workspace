"use client";

import { formatPrice } from "@/lib/utils/format";
import styles from "./ProductDetailPrice.module.scss";

interface ProductDetailPriceProps {
  price: number;
  discountedPrice?: number;
  currency?: string;
}

export default function ProductDetailPrice({
  price,
  discountedPrice,
  currency = "USD",
}: ProductDetailPriceProps) {
  const hasDiscount = discountedPrice !== undefined && discountedPrice < price;
  const displayPrice = hasDiscount ? discountedPrice! : price;
  const savings = hasDiscount ? price - discountedPrice! : 0;

  return (
    <div className={styles.priceContainer}>
      <div className={styles.priceRow}>
        <span className={styles.currentPrice}>
          {formatPrice(displayPrice, currency)}
        </span>

        {hasDiscount && (
          <span className={styles.originalPrice}>
            {formatPrice(price, currency)}
          </span>
        )}

        {hasDiscount && savings > 0 && (
          <div className={styles.savingsBox}>
            <span className={styles.savingsText}>
              You save {formatPrice(savings, currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
