"use client";

import { VariantSelectableProduct } from "@/types/Product.types";
import { usePathname } from "next/navigation";
import ProductColorSelector from "./ProductColorSelector";
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
  const pathname = usePathname();
  const currentSlug = pathname.split("/").pop() || "";

  const currentVariantValue = getVariantValue(currentProduct, variantType);
  const label = getVariantLabel(variantType);

  const filteredVariants = useProductVariants({
    variantType,
    variants,
    currentSlug,
  });

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
        <ProductSizeSelector
          variants={filteredVariants}
          currentSlug={currentSlug}
        />
      ) : (
        <ProductColorSelector
          variants={filteredVariants}
          currentSlug={currentSlug}
          currency={currency}
        />
      )}
    </div>
  );
}
