import { sql, eq, and, or, ilike, gte, lte, asc, desc } from "drizzle-orm";
import { products } from "../../../db/schema/product.schema";
import type { SortOption, ProductFilters } from "../types";

/**
 * Escape special characters for SQL LIKE patterns
 */
const escapeLikePattern = (str: string): string => {
  return str.replace(/[%_\\]/g, "\\$&");
};

/**
 * Build category path filter condition
 * Matches products where categoryPath contains the given slug at any level
 */
export const buildCategoryPathCondition = (categorySlug: string) => {
  const escaped = escapeLikePattern(categorySlug);
  return or(
    eq(products.categoryPath, escaped),
    ilike(products.categoryPath, `${escaped}#%`),
    ilike(products.categoryPath, `%#${escaped}#%`),
    ilike(products.categoryPath, `%#${escaped}`)
  );
};

/**
 * Build collection filter condition using JSONB containment
 */
export const buildCollectionCondition = (collectionSlug: string) => {
  return sql`${products.collectionSlugs} @> ${JSON.stringify([collectionSlug])}::jsonb`;
};

/**
 * Build price range conditions
 */
export const buildPriceConditions = (filters: ProductFilters) => {
  const conditions = [];

  if (filters.minPrice !== undefined) {
    conditions.push(
      gte(sql`CAST(${products.price} AS DECIMAL)`, filters.minPrice)
    );
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(
      lte(sql`CAST(${products.price} AS DECIMAL)`, filters.maxPrice)
    );
  }

  return conditions;
};

/**
 * Build ORDER BY clause based on sort option
 */
export const buildOrderByClause = (sort: SortOption = "newest") => {
  switch (sort) {
    case "price-low":
      return asc(sql`CAST(${products.price} AS DECIMAL)`);
    case "price-high":
      return desc(sql`CAST(${products.price} AS DECIMAL)`);
    case "name":
      return asc(products.name);
    case "newest":
    default:
      return desc(products.createdAt);
  }
};

/**
 * Build base WHERE conditions for product listing
 */
export const buildBaseConditions = (
  categorySlug?: string,
  collectionSlug?: string
) => {
  const conditions = [eq(products.isActive, true)];

  if (categorySlug) {
    const categoryCondition = buildCategoryPathCondition(categorySlug);
    if (categoryCondition) {
      conditions.push(categoryCondition);
    }
  }

  if (collectionSlug) {
    conditions.push(buildCollectionCondition(collectionSlug));
  }

  return and(...conditions);
};
