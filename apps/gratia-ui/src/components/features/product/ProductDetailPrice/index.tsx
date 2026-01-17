"use client";

import { formatPrice } from "@/lib/utils/format";
import styles from "./ProductDetailPrice.module.scss";

interface ProductDetailPriceProps {
  price: string;
  discountedPrice?: string | null;
  currency?: string;
}

export default function ProductDetailPrice({
  price,
  discountedPrice,
  currency = "USD",
}: ProductDetailPriceProps) {
  const priceValue = parseFloat(price);
  const discountedPriceValue = discountedPrice
    ? parseFloat(discountedPrice)
    : null;

  // Only show discount if discountedPrice exists and is less than original price
  const hasDiscount =
    discountedPriceValue !== null &&
    discountedPriceValue !== undefined &&
    !isNaN(discountedPriceValue) &&
    discountedPriceValue < priceValue &&
    discountedPriceValue > 0;

  const displayPrice = hasDiscount ? discountedPriceValue : priceValue;
  const savings = hasDiscount ? priceValue - discountedPriceValue : 0;

  return (
    <div className={styles.priceContainer}>
      <div className={styles.priceRow}>
        <span className={styles.currentPrice}>
          {formatPrice(displayPrice, currency)}
        </span>

        {hasDiscount && (
          <span className={styles.originalPrice}>
            {formatPrice(priceValue, currency)}
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
