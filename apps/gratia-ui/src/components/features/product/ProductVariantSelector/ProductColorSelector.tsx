"use client";

import { VariantSelectableProduct } from "@/types/Product.types";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProductVariantSelector.module.scss";

interface ProductColorSelectorProps {
  variants: VariantSelectableProduct[];
  currentSlug: string;
}

export default function ProductColorSelector({
  variants,
  currentSlug,
}: ProductColorSelectorProps) {
  return (
    <div className={styles.swatchGrid}>
      {variants.map((variant) => {
        const isActive = variant.slug === currentSlug;
        const firstImage = variant.images?.[0];

        return (
          <Link
            key={variant.id}
            href={`/products/${variant.slug}`}
            className={`${styles.swatch} ${isActive ? styles.active : ""}`}
            prefetch={false}
            aria-label={`Variant ${variant.slug}`}
          >
            {firstImage ? (
              <Image
                src={firstImage}
                alt=""
                fill
                className={styles.swatchImage}
                sizes="56px"
                quality={60}
                loading="lazy"
              />
            ) : (
              <span className={styles.swatchPlaceholder} />
            )}
          </Link>
        );
      })}
    </div>
  );
}
