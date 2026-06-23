"use server";

import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import {
  FilterOptionsResponse,
  ProductDetailResponse,
  ProductFiltersDto,
  ProductListItem,
  ProductListResponse,
  ProductQueryOptionsDto,
  SearchSuggestionsResponse,
  SortOptions,
} from "@/types/Product.types";
import { unstable_cache } from "next/cache";

const CACHE_TTL_SECONDS = 60;

/**
 * Builds URL query string from options and filters
 */
function buildQueryString(
  options: ProductQueryOptionsDto,
  filters?: ProductFiltersDto,
): string {
  const params = new URLSearchParams();

  // Add query options
  if (options.categorySlug) params.set("categorySlug", options.categorySlug);
  if (options.collectionSlug)
    params.set("collectionSlug", options.collectionSlug);
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
      if (key === "minPrice" || key === "maxPrice" || key === "brandSlugs")
        continue;
      if (Array.isArray(value) && value.length > 0) {
        params.set(`filters[${key}]`, value.join(","));
      }
    }
  }

  return params.toString();
}

/**
 * Fetches products with optional filtering and pagination
 *
 * @param options - Query options (categorySlug, collectionSlug, sort, page, limit)
 * @param filters - Optional filters (minPrice, maxPrice, brandSlugs, attributes)
 */
export async function getProducts(
  options: ProductQueryOptionsDto = {},
  filters?: ProductFiltersDto,
): Promise<IApiResponse<ProductListResponse>> {
  const queryString = buildQueryString(options, filters);
  const url = queryString ? `/products?${queryString}` : "/products";

  const tags = ["products"];
  if (options.categorySlug) tags.push(`category:${options.categorySlug}`);
  if (options.collectionSlug) tags.push(`collection:${options.collectionSlug}`);

  const cached = unstable_cache(
    () => apiClient.get<ProductListResponse>(url),
    ["products:list", url],
    { revalidate: CACHE_TTL_SECONDS, tags },
  );
  return await cached();
}

/**
 * Fetches a single product by slug with variants
 */
export async function getProductBySlug(
  slug: string,
): Promise<IApiResponse<ProductDetailResponse>> {
  const cached = unstable_cache(
    () => apiClient.get<ProductDetailResponse>(`/products/${slug}`),
    ["products:detail", slug],
    {
      revalidate: CACHE_TTL_SECONDS,
      tags: ["products", `product:${slug}`],
    },
  );
  return await cached();
}

/**
 * Fetches featured products
 */
export async function getFeaturedProducts(
  limit?: number,
): Promise<IApiResponse<ProductListItem[]>> {
  const url = limit
    ? `/products/featured?limit=${limit}`
    : "/products/featured";
  const cached = unstable_cache(
    () => apiClient.get<ProductListItem[]>(url),
    ["products:featured", url],
    { revalidate: CACHE_TTL_SECONDS, tags: ["products", "featured"] },
  );
  return await cached();
}

/**
 * Search products using full-text search
 */
export async function searchProducts(
  query: string,
  sort: SortOptions = "relevance",
  page: number = 1,
  limit: number = 12,
  filters?: ProductFiltersDto,
): Promise<IApiResponse<ProductListResponse>> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("sort", sort);
  params.set("page", String(page));
  params.set("limit", String(limit));

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
    for (const [key, value] of Object.entries(filters)) {
      if (key === "minPrice" || key === "maxPrice" || key === "brandSlugs")
        continue;
      if (Array.isArray(value) && value.length > 0) {
        params.set(`filters[${key}]`, value.join(","));
      }
    }
  }

  return await apiClient.get(`/products/search?${params.toString()}`);
}

/**
 * Get search autocomplete suggestions
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 8,
): Promise<IApiResponse<SearchSuggestionsResponse>> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", String(limit));
  return await apiClient.get(
    `/products/search/suggestions?${params.toString()}`,
  );
}

/**
 * Fetches available filter options for products (with faceted search support)
 *
 * @param categorySlug - Optional category filter
 * @param collectionSlug - Optional collection filter
 * @param activeFilters - Optional active filters for faceted count calculation
 * @param searchQuery - Optional search query to scope filter options to search results
 */
export async function getFilterOptions(
  categorySlug?: string,
  collectionSlug?: string,
  activeFilters?: ProductFiltersDto,
  searchQuery?: string,
): Promise<IApiResponse<FilterOptionsResponse>> {
  const params = new URLSearchParams();

  if (categorySlug) params.set("categorySlug", categorySlug);
  if (collectionSlug) params.set("collectionSlug", collectionSlug);
  if (searchQuery) params.set("q", searchQuery);

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
      if (key === "minPrice" || key === "maxPrice" || key === "brandSlugs")
        continue;
      if (Array.isArray(value) && value.length > 0) {
        params.set(`filters[${key}]`, value.join(","));
      }
    }
  }

  const queryString = params.toString();
  const url = queryString
    ? `/products/filters?${queryString}`
    : "/products/filters";

  const tags = ["filters"];
  if (categorySlug) tags.push(`category:${categorySlug}`);
  if (collectionSlug) tags.push(`collection:${collectionSlug}`);

  const cached = unstable_cache(
    () => apiClient.get<FilterOptionsResponse>(url),
    ["products:filters", url],
    { revalidate: CACHE_TTL_SECONDS, tags },
  );
  return await cached();
}
