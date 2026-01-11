"use client";

import { Product } from "@/types/Product.types";
import Link from "next/link";
import styles from "./ProductVariantSelector.module.scss";
import { getVariantValue } from "./utils";

interface ProductSizeSelectorProps {
  variants: Product[];
  currentSlug: string;
}

export default function ProductSizeSelector({
  variants,
  currentSlug,
}: ProductSizeSelectorProps) {
  return (
    <div className={styles.sizeButtonsContainer}>
      {variants.map((variant) => {
        const isActive = variant.slug === currentSlug;
        const sizeValue = getVariantValue(variant, "size");

        return (
          <Link
            key={variant.id}
            href={`/products/${variant.slug}`}
            className={`${styles.sizeButton} ${isActive ? styles.active : ""}`}
            prefetch={false}
          >
            {sizeValue}
          </Link>
        );
      })}
    </div>
  );
}
