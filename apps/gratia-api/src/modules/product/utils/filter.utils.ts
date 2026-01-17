import type { ProductFiltersDto } from "../types/ProductQueryOptionsDto";

const parseArrayFilter = (value: unknown): string[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value as string];
};

const parseNumberFilter = (value: unknown): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

/**
 * Parse product filters from query parameters
 * Supports dynamic attribute filters: filters[attributeKey]=value1,value2
 * Example: filters[color]=red&filters[size]=M or filters[cpu]=i7
 */
export const parseProductFilters = (
  query: Record<string, unknown>
): ProductFiltersDto | undefined => {
  const filters: ProductFiltersDto = {};

  // Parse dynamic attribute filters
  // Pattern: filters[attributeKey]=value1,value2
  const filterPattern = /^filters\[(.+)\]$/;
  for (const [key, value] of Object.entries(query)) {
    const match = key.match(filterPattern);
    if (match && match[1]) {
      const attributeKey = match[1];
      // Skip minPrice and maxPrice (handled separately)
      if (attributeKey === "minPrice" || attributeKey === "maxPrice") {
        continue;
      }
      const arrayValue = parseArrayFilter(value);
      if (arrayValue) {
        filters[attributeKey] = arrayValue;
      }
    }
  }

  // Parse price filters
  const minPrice = parseNumberFilter(query["filters[minPrice]"]);
  if (minPrice !== undefined) filters.minPrice = minPrice;

  const maxPrice = parseNumberFilter(query["filters[maxPrice]"]);
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;

  return Object.keys(filters).length > 0 ? filters : undefined;
};
