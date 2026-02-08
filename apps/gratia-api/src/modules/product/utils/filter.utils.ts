import type { ProductFilters, SortOption, ProductListQueryOptions } from "../types";

/**
 * Parse array filter value from query string
 */
const parseArrayFilter = (value: unknown): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    return value.includes(",") ? value.split(",") : [value];
  }
  return [String(value)];
};

/**
 * Parse numeric filter value from query string
 */
const parseNumberFilter = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

/**
 * Parse product filters from query parameters
 *
 * Supported patterns:
 * - filters[minPrice]=100
 * - filters[maxPrice]=500
 * - filters[brandSlugs]=nike,adidas (for future attribute filtering)
 * - filters[color]=red,blue (for future attribute filtering)
 */
export const parseProductFilters = (
  query: Record<string, unknown>
): ProductFilters | undefined => {
  const filters: ProductFilters = {};
  const filterPattern = /^filters\[(.+)\]$/;

  for (const [key, value] of Object.entries(query)) {
    const match = key.match(filterPattern);
    if (!match?.[1]) continue;

    const filterKey = match[1];

    if (filterKey === "minPrice") {
      const minPrice = parseNumberFilter(value);
      if (minPrice !== undefined) filters.minPrice = minPrice;
    } else if (filterKey === "maxPrice") {
      const maxPrice = parseNumberFilter(value);
      if (maxPrice !== undefined) filters.maxPrice = maxPrice;
    } else {
      // Dynamic attribute filters (for future use)
      const arrayValue = parseArrayFilter(value);
      if (arrayValue?.length) {
        filters[filterKey] = arrayValue;
      }
    }
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
};

/**
 * Parse sort option from query string
 */
export const parseSortOption = (value: unknown): SortOption | undefined => {
  const validOptions: SortOption[] = ["newest", "price-low", "price-high", "name", "relevance"];
  if (typeof value === "string" && validOptions.includes(value as SortOption)) {
    return value as SortOption;
  }
  return undefined;
};

/**
 * Parse pagination options from query
 */
export const parsePagination = (query: Record<string, unknown>) => {
  const page = Math.max(1, parseNumberFilter(query.page) ?? 1);
  const limit = Math.min(100, Math.max(1, parseNumberFilter(query.limit) ?? 12));
  return { page, limit };
};

/**
 * Parse full query options from request query
 */
export const parseProductListQuery = (
  query: Record<string, unknown>
): ProductListQueryOptions => {
  const { page, limit } = parsePagination(query);

  return {
    categorySlug: typeof query.categorySlug === "string" ? query.categorySlug : undefined,
    collectionSlug: typeof query.collectionSlug === "string" ? query.collectionSlug : undefined,
    sort: parseSortOption(query.sort),
    page,
    limit,
  };
};