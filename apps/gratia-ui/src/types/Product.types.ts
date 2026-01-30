export interface ProductCategory {
  label: string;
  value: string;
}

export type ProductColor =
  | "black"
  | "white"
  | "gray"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "purple"
  | "pink"
  | "brown"
  | "beige"
  | "navy"
  | "teal"
  | "burgundy"
  | "olive"
  | "cream"
  | "tan"
  | "maroon"
  | "coral"
  | "silver"
  | "gold"
  | "khaki"
  | "mint"
  | "lavender";

export type ProductSize =
  | "XXS"
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL"
  | "one-size";

export type ProductMaterial =
  | "cotton"
  | "polyester"
  | "wool"
  | "silk"
  | "linen"
  | "denim"
  | "leather"
  | "suede"
  | "cashmere"
  | "nylon"
  | "spandex"
  | "rayon"
  | "velvet"
  | "satin"
  | "acrylic"
  | "modal"
  | "viscose";

export type SortOptions = "newest" | "price-low" | "price-high" | "name";

export interface ProductAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface Vendor {
  id: number;
  storeName: string;
  storeSlug: string;
  logo?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  categoryId: number;
  category?: Category | null;
  categoryPath?: string;
  collectionSlugs?: string[];
  brandId?: number | null;
  brand?: Brand | null;
  vendorId?: number | null;
  vendor?: Vendor | null;
  price: string;
  discountedPrice?: string | null;
  stock: number;
  attributes: ProductAttributes;
  images: string[];
  productGroupId: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// V2 API Types - Product List
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

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductListResponse {
  products: ProductListItem[];
  pagination: PaginationInfo;
}

// ============================================================================
// V2 API Types - Product Detail
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
  attributes: Record<string, unknown>;
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
  attributes: Record<string, unknown>;
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

// Common type for variant selection (shared properties between ProductDetailResponse and ProductVariant)
export interface VariantSelectableProduct {
  id: number;
  slug: string;
  price: string;
  discountedPrice: string | null;
  images: string[];
  attributes: Record<string, unknown>;
}

// Common type for cart operations
export interface CartableProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  discountedPrice?: string | null;
  images: string[];
  attributes?: Record<string, unknown>;
}

// ============================================================================
// V2 API Types - Filter Options
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
// Query Options
// ============================================================================

export interface ProductFiltersDto {
  minPrice?: number;
  maxPrice?: number;
  brandSlugs?: string[];
  [key: string]: string[] | number | undefined;
}

export interface ProductQueryOptionsDto {
  categorySlug?: string;
  collectionSlug?: string;
  sort?: SortOptions;
  page?: number;
  limit?: number;
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

export interface FilterOptions {
  colors: string[];
  sizes: string[];
  materials: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface ProductsResponseDto {
  products: Partial<Product>[];
  filters: FilterOptions;
  pagination: PaginationInfo;
  sortOptions: string[];
}

export interface AttributeDefinition {
  key: string;
  type: "string" | "number" | "boolean" | "enum";
  label: string;
  required: boolean;
  enumValues?: string[];
  unit?: string;
  min?: number;
  max?: number;
  defaultValue?: string | number | boolean;
  sortOrder: number;
}

export interface CategoryAttributeTemplate {
  id: number;
  categoryId: number;
  attributeDefinitions: AttributeDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithVariantsDto {
  product: Product;
  variants: Product[];
  availableOptions: Record<string, string[]>;
  attributeTemplate?: CategoryAttributeTemplate;
}
