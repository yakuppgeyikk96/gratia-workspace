import { Product } from "../../../db/schema/product.schema";

export type FilterOptions = Record<string, string[]> & {
  priceRange: {
    min: number;
    max: number;
  };
};

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductsResponseDto {
  products: Product[];
  pagination: PaginationInfo;
  sortOptions: string[];
}

export default ProductsResponseDto;
