import { VariantSelectableProduct } from "@/types/Product.types";
import { useMemo } from "react";
import { VariantType } from "./utils";

interface UseProductVariantsProps {
  variantType: VariantType;
  variants: VariantSelectableProduct[];
  currentSlug: string;
}

export function useProductVariants({
  variantType,
  variants,
  currentSlug,
}: UseProductVariantsProps) {
  return useMemo(() => {
    if (variantType === "size") {
      // Get unique size values
      const uniqueSizes = Array.from(
        new Set(
          variants
            .map((p) => p.attributes.size)
            .filter((size): size is string => typeof size === "string" && !!size)
        )
      );

      // For each unique size, find the first product with that size
      return uniqueSizes.map((size) => {
        const matchingProduct =
          variants.find(
            (p) => p.attributes.size === size && p.slug === currentSlug
          ) ||
          variants.find((p) => p.attributes.size === size);
        return matchingProduct!;
      }).filter(Boolean);
    } else {
      // For color: show all variants with images, remove duplicates
      return variants.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
      );
    }
  }, [variants, variantType, currentSlug]);
}
