import { Product, ProductSize } from "@/types/Product.types";
import { useMemo } from "react";
import { VariantType } from "./utils";

interface UseProductVariantsProps {
  variantType: VariantType;
  currentProduct: Product;
  variants: Product[];
  currentSlug: string;
}

export function useProductVariants({
  variantType,
  currentProduct,
  variants,
  currentSlug,
}: UseProductVariantsProps) {
  return useMemo(() => {
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
      return sameGroupProducts.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
      );
    }
  }, [variants, currentProduct, variantType, currentSlug]);
}
