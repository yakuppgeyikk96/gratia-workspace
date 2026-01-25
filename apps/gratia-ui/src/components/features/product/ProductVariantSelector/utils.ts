import { VariantSelectableProduct } from "@/types/Product.types";

export type VariantType = string;

export const getVariantLabel = (variantType: VariantType): string => {
  // Special cases for known types
  if (variantType === "size") return "Size";
  if (variantType === "color") return "Color";

  // Generic formatting for other types: "material_type" -> "Material Type"
  return variantType
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getVariantValue = (
  product: VariantSelectableProduct,
  variantType: VariantType,
): string => {
  const value = product.attributes[variantType];
  if (!value) return "";

  const stringValue = String(value);
  if (variantType === "size") {
    return stringValue.toUpperCase();
  }
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
};
