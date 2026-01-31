import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import {
  FilterOptionsResponse,
  ProductDetailResponse,
  ProductFiltersDto,
  ProductListItem,
  ProductListResponse,
  ProductQueryOptionsDto,
} from "@/types/Product.types";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Builds URL query string from options and filters
 */
function buildQueryString(
  options: ProductQueryOptionsDto,
  filters?: ProductFiltersDto
): string {
  const params = new URLSearchParams();

  // Add query options
  if (options.categorySlug) params.set("categorySlug", options.categorySlug);
  if (options.collectionSlug) params.set("collectionSlug", options.collectionSlug);
  if (options.sort) params.set("sort", options.sort);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));

  // Add filters
  if (filters) {
    if (filters.minPrice !== undefined) {
      params.set("filters[minPrice]", String(filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      params.set("filters[maxPrice]", String(filters.maxPrice));
    }
    if (filters.brandSlugs?.length) {
      params.set("filters[brandSlugs]", filters.brandSlugs.join(","));
    }

    // Add dynamic attribute filters
    for (const [key, value] of Object.entries(filters)) {
      if (key === "minPrice" || key === "maxPrice" || key === "brandSlugs") continue;
      if (Array.isArray(value) && value.length > 0) {
        params.set(`filters[${key}]`, value.join(","));
      }
    }
  }

  return params.toString();
}

// ============================================================================
// Product List
// ============================================================================

/**
 * Fetches products with optional filtering and pagination
 *
 * @param options - Query options (categorySlug, collectionSlug, sort, page, limit)
 * @param filters - Optional filters (minPrice, maxPrice, brandSlugs, attributes)
 */
export async function getProducts(
  options: ProductQueryOptionsDto = {},
  filters?: ProductFiltersDto
): Promise<IApiResponse<ProductListResponse>> {
  const queryString = buildQueryString(options, filters);
  const url = queryString ? `/products?${queryString}` : "/products";
  return await apiClient.get(url);
}

// ============================================================================
// Product Detail
// ============================================================================

/**
 * Fetches a single product by slug with variants
 */
export async function getProductBySlug(
  slug: string
): Promise<IApiResponse<ProductDetailResponse>> {
  return await apiClient.get(`/products/${slug}`);
}

// ============================================================================
// Featured Products
// ============================================================================

/**
 * Fetches featured products
 */
export async function getFeaturedProducts(
  limit?: number
): Promise<IApiResponse<ProductListItem[]>> {
  const url = limit ? `/products/featured?limit=${limit}` : "/products/featured";
  return await apiClient.get(url);
}

// ============================================================================
// Filter Options
// ============================================================================

/**
 * Fetches available filter options for products (with faceted search support)
 *
 * @param categorySlug - Optional category filter
 * @param collectionSlug - Optional collection filter
 * @param activeFilters - Optional active filters for faceted count calculation
 */
export async function getFilterOptions(
  categorySlug?: string,
  collectionSlug?: string,
  activeFilters?: ProductFiltersDto
): Promise<IApiResponse<FilterOptionsResponse>> {
  const params = new URLSearchParams();

  if (categorySlug) params.set("categorySlug", categorySlug);
  if (collectionSlug) params.set("collectionSlug", collectionSlug);

  // Add active filters for faceted search
  if (activeFilters) {
    if (activeFilters.minPrice !== undefined) {
      params.set("filters[minPrice]", String(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice !== undefined) {
      params.set("filters[maxPrice]", String(activeFilters.maxPrice));
    }
    if (activeFilters.brandSlugs?.length) {
      params.set("filters[brandSlugs]", activeFilters.brandSlugs.join(","));
    }
    // Add dynamic attribute filters
    for (const [key, value] of Object.entries(activeFilters)) {
      if (key === "minPrice" || key === "maxPrice" || key === "brandSlugs") continue;
      if (Array.isArray(value) && value.length > 0) {
        params.set(`filters[${key}]`, value.join(","));
      }
    }
  }

  const queryString = params.toString();
  const url = queryString ? `/products/filters?${queryString}` : "/products/filters";

  return await apiClient.get(url);
}
