export type SortOptions = "newest" | "price-low" | "price-high" | "name";

export interface ProductFiltersDto {
  [key: string]: string[] | number | undefined;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductQueryOptionsDto {
  categorySlug?: string;
  collectionSlug?: string;
  filters?: ProductFiltersDto;
  sort?: SortOptions;
  page?: number;
  limit?: number;
}

export default ProductQueryOptionsDto;
