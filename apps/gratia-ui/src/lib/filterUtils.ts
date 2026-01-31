import { ProductFiltersState } from "@/store/productFilterStore";
import { ProductFiltersDto } from "@/types/Product.types";

/** Query param keys that are not attribute filters */
export const KNOWN_QUERY_KEYS = ["page", "sort", "minPrice", "maxPrice", "brands"] as const;

/**
 * Parse filter parameters from URL search params (server-side)
 *
 * Supports:
 * - minPrice, maxPrice: Number filters
 * - brands: Comma-separated brand slugs
 * - Any other param: Treated as attribute filter with comma-separated values
 */
export function parseFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ProductFiltersDto | undefined {
  const filters: ProductFiltersDto = {};

  // Parse min/max price
  const minPrice = searchParams.minPrice;
  if (typeof minPrice === "string") {
    const num = parseFloat(minPrice);
    if (!isNaN(num)) {
      filters.minPrice = num;
    }
  }

  const maxPrice = searchParams.maxPrice;
  if (typeof maxPrice === "string") {
    const num = parseFloat(maxPrice);
    if (!isNaN(num)) {
      filters.maxPrice = num;
    }
  }

  // Parse brands
  const brands = searchParams.brands;
  if (typeof brands === "string" && brands) {
    filters.brandSlugs = brands.split(",").filter(Boolean);
  }

  // Parse dynamic attributes (skip known keys)
  for (const [key, value] of Object.entries(searchParams)) {
    if ((KNOWN_QUERY_KEYS as readonly string[]).includes(key)) continue;

    if (typeof value === "string" && value) {
      const values = value.split(",").filter(Boolean);
      if (values.length > 0) {
        filters[key] = values;
      }
    }
  }

  // Return undefined if no filters
  return Object.keys(filters).length > 0 ? filters : undefined;
}

/**
 * Parse page number from search params
 */
export function parsePageFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): number {
  const page = searchParams.page;
  if (typeof page === "string") {
    const num = parseInt(page, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }
  return 1;
}

/**
 * Parse sort option from search params
 */
export function parseSortFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): string | undefined {
  const sort = searchParams.sort;
  if (typeof sort === "string" && sort) {
    return sort;
  }
  return undefined;
}

/**
 * Build URL search params from filter state
 */
export function buildSearchParams(
  filters: ProductFiltersState,
  page?: number,
  sort?: string | null
): URLSearchParams {
  const params = new URLSearchParams();

  // Add page (only if > 1)
  if (page && page > 1) {
    params.set("page", String(page));
  }

  // Add sort
  if (sort) {
    params.set("sort", sort);
  }

  // Add price filters
  if (filters.minPrice !== null) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== null) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  // Add brands
  if (filters.brandSlugs.length > 0) {
    params.set("brands", filters.brandSlugs.join(","));
  }

  // Add attributes
  for (const [key, values] of Object.entries(filters.attributes)) {
    if (values.length > 0) {
      params.set(key, values.join(","));
    }
  }

  return params;
}
