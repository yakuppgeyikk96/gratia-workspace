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
  color?: ProductColor;
  size?: ProductSize;
  material?: ProductMaterial;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  categoryId: string | Partial<ProductCategory>;
  categoryPath?: string;
  collectionSlugs?: string[];
  price: number;
  discountedPrice?: number;
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

export interface ProductFiltersDto {
  colors?: string[];
  sizes?: string[];
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

export interface ProductWithVariantsDto {
  product: Product;
  variants: Product[];
  availableOptions: {
    colors: string[];
    sizes: string[];
    materials: string[];
  };
}
