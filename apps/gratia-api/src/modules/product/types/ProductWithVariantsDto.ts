import type { CategoryAttributeTemplate } from "../../../db/schema/category-attribute-template.schema";
import type { Product } from "../../../db/schema/product.schema";

export interface ProductWithVariantsDto {
  product: Product;
  variants: Product[];
  availableOptions: Record<string, string[]>; // Dynamic: { color: [...], size: [...], cpu: [...], etc. }
  attributeTemplate?: CategoryAttributeTemplate; // For frontend rendering
}

export default ProductWithVariantsDto;
