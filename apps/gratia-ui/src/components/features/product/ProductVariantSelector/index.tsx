"use client";

import { formatPrice } from "@/lib/format";
import { Product, ProductSize } from "@/types/Product.types";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import styles from "./ProductVariantSelector.module.scss";

type VariantType = "size" | "color";

interface ProductVariantSelectorProps {
  variantType: VariantType;
  currentProduct: Product;
  variants: Product[];
  currency?: string;
}

const getVariantLabel = (variantType: VariantType): string => {
  const labels: Record<VariantType, string> = {
    size: "Size",
    color: "Color",
  };
  return labels[variantType];
};

const getVariantValue = (
  product: Product,
  variantType: VariantType
): string => {
  const value = product.attributes[variantType];
  if (!value) return "";

  // For size, return uppercase, for color capitalize first letter
  const stringValue = String(value);
  if (variantType === "size") {
    return stringValue.toUpperCase();
  }
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
};

export default function ProductVariantSelector({
  variantType,
  currentProduct,
  variants,
  currency = "USD",
}: ProductVariantSelectorProps) {
  const pathname = usePathname();
  const currentSlug = pathname.split("/").pop() || "";

  const currentVariantValue = getVariantValue(currentProduct, variantType);
  const label = getVariantLabel(variantType);

  // For size: get unique size values and find a product for each
  // For color: show all variants with images and prices
  const filteredVariants = useMemo(() => {
    if (variantType === "size") {
      // Get unique size values from all products in the same group
      const allProducts = [...variants];
      const sameGroupProducts = allProducts.filter(
        (product) => product.productGroupId === currentProduct.productGroupId
      );

      // Get unique size values
      const uniqueSizes = Array.from(
        new Set(
          sameGroupProducts
            .map((p) => p.attributes.size)
            .filter((size): size is ProductSize => !!size)
        )
      );

      // For each unique size, find the first product with that size
      // Prefer current product if it matches
      return uniqueSizes.map((size) => {
        const matchingProduct =
          sameGroupProducts.find(
            (p) => p.attributes.size === size && p.slug === currentSlug
          ) ||
          sameGroupProducts.find((p) => p.attributes.size === size) ||
          currentProduct;
        return matchingProduct;
      });
    } else {
      // For color: show all variants with images
      const allProducts = [...variants];
      const sameGroupProducts = allProducts.filter(
        (product) => product.productGroupId === currentProduct.productGroupId
      );

      // Remove duplicates based on _id
      const uniqueProducts = sameGroupProducts.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p._id === product._id)
      );

      return uniqueProducts;
    }
  }, [variants, currentProduct, variantType, currentSlug]);

  // If no variants to show or only one product (current product), don't render
  if (filteredVariants.length <= 1) {
    return null;
  }

  const isSizeSelector = variantType === "size";

  return (
    <div className={styles.variantSelector}>
      <div className={styles.label}>
        {label}: {currentVariantValue}
      </div>

      {isSizeSelector ? (
        // Size selector: Just buttons
        <div className={styles.sizeButtonsContainer}>
          {filteredVariants.map((variant) => {
            const isActive = variant.slug === currentSlug;
            const sizeValue = getVariantValue(variant, "size");

            return (
              <Link
                key={variant._id}
                href={`/products/${variant.slug}`}
                className={`${styles.sizeButton} ${isActive ? styles.active : ""}`}
              >
                {sizeValue}
              </Link>
            );
          })}
        </div>
      ) : (
        // Color selector: Images with prices
        <div className={styles.variantsGrid}>
          {filteredVariants.map((variant) => {
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
      )}
    </div>
  );
}
