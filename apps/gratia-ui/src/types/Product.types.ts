import { Category } from "./Category.types";

export interface ProductVariantAttributes {
  color?: string;
  size?: string;
  material?: string;
  brand?: string;
  style?: string;
  pattern?: string;
}

export interface ProductVariant {
  attributes: ProductVariantAttributes;
  sku: string;
  stock: number;
  price?: number;
  discountedPrice?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  categoryId: string | Partial<Category>;
  categoryPath?: string; // Example: "men#shoes#sneakers"
  collectionSlugs?: string[];
  basePrice: number;
  baseDiscountedPrice?: number;
  images: string[];
  variants: ProductVariant[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SortOptions = "newest" | "price-low" | "price-high" | "name";

export interface ProductFiltersDto {
  colors?: string[];
  sizes?: string[];
  brands?: string[];
  materials?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductQueryOptionsDto {
  categorySlug?: string;
  collectionSlug?: string;
  filters?: ProductFiltersDto;
  sort?: SortOptions;
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  colors: string[];
  sizes: string[];
  materials: string[];
  brands: string[];
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

export interface ProductsResponseDto {
  products: Partial<Product>[];
  filters: FilterOptions;
  pagination: PaginationInfo;
  sortOptions: string[];
}
