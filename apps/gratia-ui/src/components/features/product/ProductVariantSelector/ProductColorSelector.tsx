"use client";

import { formatPrice } from "@/lib/utils/format";
import { Product } from "@/types/Product.types";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProductVariantSelector.module.scss";

interface ProductColorSelectorProps {
  variants: Product[];
  currentSlug: string;
  currency?: string;
}

export default function ProductColorSelector({
  variants,
  currentSlug,
  currency = "USD",
}: ProductColorSelectorProps) {
  return (
    <div className={styles.variantsGrid}>
      {variants.map((variant) => {
        const isActive = variant.slug === currentSlug;
        const firstImage = variant.images?.[0];
        const displayPrice = variant.discountedPrice || variant.price;

        return (
          <Link
            key={variant._id}
            href={`/products/${variant.slug}`}
            className={`${styles.variantCard} ${isActive ? styles.active : ""}`}
          >
            <div className={styles.variantImageContainer}>
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={variant.name}
                  fill
                  className={styles.variantImage}
                  sizes="(max-width: 768px) 100px, 120px"
                  quality={60}
                  loading="lazy"
                />
              ) : (
                <div className={styles.placeholderImage}>No Image</div>
              )}
            </div>
            <div className={styles.variantPrice}>
              {formatPrice(displayPrice, currency)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
