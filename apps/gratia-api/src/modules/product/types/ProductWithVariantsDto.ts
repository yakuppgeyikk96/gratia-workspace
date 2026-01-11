import { Product } from "../../../db/schema/product.schema";

export interface ProductWithVariantsDto {
  product: Product;
  variants: Product[];
  availableOptions: {
    colors: string[];
    sizes: string[];
    materials: string[];
  };
}

export default ProductWithVariantsDto;
