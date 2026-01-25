"use client";

import { VariantSelectableProduct } from "@/types/Product.types";
import Link from "next/link";
import styles from "./ProductVariantSelector.module.scss";
import { getVariantValue } from "./utils";

interface ProductGenericSelectorProps {
  variants: VariantSelectableProduct[];
  currentSlug: string;
  variantType: string;
}

export default function ProductGenericSelector({
  variants,
  currentSlug,
  variantType,
}: ProductGenericSelectorProps) {
  return (
    <div className={styles.sizeButtonsContainer}>
      {variants.map((variant) => {
        const isActive = variant.slug === currentSlug;
        const value = getVariantValue(variant, variantType);

        return (
          <Link
            key={variant.id}
            href={`/products/${variant.slug}`}
            className={`${styles.sizeButton} ${isActive ? styles.active : ""}`}
            prefetch={false}
          >
            {value}
          </Link>
        );
      })}
    </div>
  );
}
