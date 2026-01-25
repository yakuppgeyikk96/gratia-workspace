import { VariantSelectableProduct } from "@/types/Product.types";
import { useMemo } from "react";
import { VariantType } from "./utils";

interface UseProductVariantsProps {
  variantType: VariantType;
  variants: VariantSelectableProduct[];
  currentProduct: VariantSelectableProduct;
}

/**
 * Calculates a similarity score between two products based on their attributes.
 * Higher score means more shared attributes (excluding the variant type being selected).
 */
const calculateMatchScore = (
  baseAttributes: Record<string, unknown>,
  candidateAttributes: Record<string, unknown>,
  variantTypeToIgnore: string,
): number => {
  let score = 0;

  for (const key in baseAttributes) {
    if (key === variantTypeToIgnore) continue;
    if (baseAttributes[key] === candidateAttributes[key]) {
      score++;
    }
  }

  return score;
};

export function useProductVariants({
  variantType,
  variants,
  currentProduct,
}: UseProductVariantsProps) {
  return useMemo(() => {
    // 1. Get unique values for this variant type (e.g., ["128GB", "256GB"])
    const uniqueValues = Array.from(
      new Set(
        variants
          .map((p) => p.attributes[variantType])
          .filter(
            (val): val is string | number =>
              (typeof val === "string" || typeof val === "number") && !!val,
          ),
      ),
    );

    // 2. Find the best matching variant for each unique value
    return uniqueValues.map((value) => {
      // Find all variants that have this specific attribute value
      const candidates = variants.filter(
        (p) => p.attributes[variantType] === value,
      );

      // Select the candidate most similar to the current product
      // This preserves other user selections (e.g., keeping "Purple" when switching "Storage")
      return candidates.reduce(
        (best, candidate) => {
          const score = calculateMatchScore(
            currentProduct.attributes,
            candidate.attributes,
            variantType,
          );

          return score > best.score ? { variant: candidate, score } : best;
        },
        { variant: candidates[0], score: -1 },
      ).variant;
    });
  }, [variants, variantType, currentProduct]);
}
