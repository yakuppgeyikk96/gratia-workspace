import type { ProductFiltersDto } from "../types/ProductQueryOptionsDto";

/**
 * Array-based filtreleri parse eder
 * Tek değerleri array'e çevirir (tutarlılık için)
 */
const parseArrayFilter = (value: unknown): string[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value as string];
};

/**
 * Numeric filtreleri parse eder
 */
const parseNumberFilter = (value: unknown): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

/**
 * Tüm product filterlarını Express query'den extract ve parse eder
 */
export const parseProductFilters = (
  query: Record<string, unknown>
): ProductFiltersDto | undefined => {
  const filters: ProductFiltersDto = {};

  const colors = parseArrayFilter(query["filters[color]"]);
  if (colors) filters.colors = colors;

  const sizes = parseArrayFilter(query["filters[size]"]);
  if (sizes) filters.sizes = sizes;

  const materials = parseArrayFilter(query["filters[material]"]);
  if (materials) filters.materials = materials;

  const minPrice = parseNumberFilter(query["filters[minPrice]"]);
  if (minPrice !== undefined) filters.minPrice = minPrice;

  const maxPrice = parseNumberFilter(query["filters[maxPrice]"]);
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;

  return Object.keys(filters).length > 0 ? filters : undefined;
};