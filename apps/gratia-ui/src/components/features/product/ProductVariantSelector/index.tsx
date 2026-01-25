"use client";

import { VariantSelectableProduct } from "@/types/Product.types";
import ProductColorSelector from "./ProductColorSelector";
import ProductGenericSelector from "./ProductGenericSelector";
import ProductSizeSelector from "./ProductSizeSelector";
import styles from "./ProductVariantSelector.module.scss";
import { useProductVariants } from "./useProductVariants";
import { getVariantLabel, getVariantValue, VariantType } from "./utils";

interface ProductVariantSelectorProps {
  variantType: VariantType;
  currentProduct: VariantSelectableProduct;
  variants: VariantSelectableProduct[];
  currency?: string;
}

export default function ProductVariantSelector({
  variantType,
  currentProduct,
  variants,
  currency = "USD",
}: ProductVariantSelectorProps) {
  const currentSlug = currentProduct.slug;
  const currentVariantValue = getVariantValue(currentProduct, variantType);
  const label = getVariantLabel(variantType);

  const filteredVariants = useProductVariants({
    variantType,
    variants,
    currentProduct,
  });

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
        <ProductSizeSelector
          variants={filteredVariants}
          currentSlug={currentSlug}
        />
      ) : variantType === "color" ? (
        <ProductColorSelector
          variants={filteredVariants}
          currentSlug={currentSlug}
          currency={currency}
        />
      ) : (
        <ProductGenericSelector
          variants={filteredVariants}
          currentSlug={currentSlug}
          variantType={variantType}
        />
      )}
    </div>
  );
}
