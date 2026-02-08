import type { Brand } from "../../../db/schema/brand.schema";
import type { Category } from "../../../db/schema/category.schema";

// ============================================================================
// Query Options
// ============================================================================

export type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "name"
  | "relevance";

export interface ProductListQueryOptions {
  categorySlug?: string | undefined;
  collectionSlug?: string | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  brandSlugs?: string[];
  [key: string]: string[] | number | undefined;
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: string;
  discountedPrice: string | null;
  images: string[];
  productGroupId: string;
  brand: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface ProductListResponse {
  products: ProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Filter Options Response
// ============================================================================

export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterOption {
  value: string;
  count: number;
}

export interface AttributeFilterOption {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "enum";
  values: FilterOption[];
}

export interface CategoryFilterOption {
  value: string;
  label: string;
  count: number;
  parentSlug: string | null;
  parentLabel: string | null;
}

export interface FilterOptionsResponse {
  priceRange: PriceRange;
  brands: FilterOption[];
  attributes: AttributeFilterOption[];
  categories: CategoryFilterOption[];
}

// ============================================================================
// Product Detail Response
// ============================================================================

export interface ProductVariant {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  discountedPrice: string | null;
  stock: number;
  images: string[];
  attributes: Record<string, any>;
  isActive: boolean;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: string;
  discountedPrice: string | null;
  stock: number;
  images: string[];
  attributes: Record<string, any>;
  productGroupId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  createdAt: Date;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  brand: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  variants: ProductVariant[];
  availableOptions: Record<string, string[]>;
}

export interface SearchSuggestion {
  text: string;
  type: "product" | "brand" | "category";
  slug: string;
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
}

export interface CategoryContext {
  id: number;
  slug: string;
  categoryPath: string;
}

export interface ProductWithRelations {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: string;
  discountedPrice: string | null;
  stock: number;
  images: string[];
  attributes: Record<string, any>;
  productGroupId: string;
  categoryId: number;
  brandId: number | null;
  vendorId: number | null;
  categoryPath: string | null;
  collectionSlugs: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  createdAt: Date;
  updatedAt: Date;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  brand: (Pick<Brand, "id" | "name" | "slug"> & { logo: string | null }) | null;
}
