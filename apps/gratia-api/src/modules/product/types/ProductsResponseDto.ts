import { Product } from "../../../db/schema/product.schema";

export interface FilterOptions {
  colors: string[];
  sizes: string[];
  materials: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductsResponseDto {
  products: Product[];
  filters: FilterOptions;
  pagination: PaginationInfo;
  sortOptions: string[];
}

export default ProductsResponseDto;
