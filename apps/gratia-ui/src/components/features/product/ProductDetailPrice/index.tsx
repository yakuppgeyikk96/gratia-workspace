"use client";

import { formatPrice } from "@/lib/utils/format";
import styles from "./ProductDetailPrice.module.scss";

interface ProductDetailPriceProps {
  price: string;
  discountedPrice?: string;
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
    : 0;

  const hasDiscount =
    discountedPriceValue !== undefined && discountedPriceValue < priceValue;
  const displayPrice = hasDiscount ? discountedPriceValue! : priceValue;

  const savings = hasDiscount ? priceValue - discountedPriceValue! : 0;

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
