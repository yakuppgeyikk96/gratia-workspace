import { VariantSelectableProduct } from "@/types/Product.types";

export type VariantType = "size" | "color";

export const getVariantLabel = (variantType: VariantType): string => {
  const labels: Record<VariantType, string> = {
    size: "Size",
    color: "Color",
  };
  return labels[variantType];
};

export const getVariantValue = (
  product: VariantSelectableProduct,
  variantType: VariantType
): string => {
  const value = product.attributes[variantType];
  if (!value) return "";

  const stringValue = String(value);
  if (variantType === "size") {
    return stringValue.toUpperCase();
  }
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
};
