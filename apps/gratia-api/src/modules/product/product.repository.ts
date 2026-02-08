import {
  aliasedTable,
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  lte,
  sql,
  SQL,
} from "drizzle-orm";
import { db } from "../../config/postgres.config";
import { brands } from "../../db/schema/brand.schema";
import { categories } from "../../db/schema/category.schema";
import { Product, products } from "../../db/schema/product.schema";
import type {
  ProductFilters,
  ProductListItem,
  ProductListQueryOptions,
  ProductVariant,
  ProductWithRelations,
  SearchSuggestion,
  SortOption,
} from "./types";
import {
  buildBaseConditions,
  buildCategoryPathCondition,
  buildCollectionCondition,
  buildOrderByClause,
  buildPriceConditions,
} from "./utils/query-builder.utils";
import {
  buildSearchCondition,
  buildSearchRankExpression,
  buildPrefixSearchCondition,
} from "./utils/search-query.utils";

// ============================================================================
// Product Listing Repository
// ============================================================================

interface FindProductsResult {
  products: ProductListItem[];
  total: number;
}

/**
 * Build filter conditions using Drizzle query builder
 */
const buildFilterConditionsForQuery = (
  categorySlug?: string,
  collectionSlug?: string,
  filters?: ProductFilters,
): SQL | undefined => {
  const conditions: (SQL | undefined)[] = [eq(products.isActive, true)];

  // Category filter
  if (categorySlug) {
    conditions.push(buildCategoryPathCondition(categorySlug));
  }

  // Collection filter
  if (collectionSlug) {
    conditions.push(buildCollectionCondition(collectionSlug));
  }

  // Price filters
  if (filters) {
    const priceConditions = buildPriceConditions(filters);
    conditions.push(...priceConditions);
  }

  // Brand filter
  if (filters?.brandSlugs && filters.brandSlugs.length > 0) {
    conditions.push(inArray(brands.slug, filters.brandSlugs));
  }

  // Dynamic attribute filters (JSONB)
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (key === "minPrice" || key === "maxPrice" || key === "brandSlugs")
        continue;

      if (Array.isArray(value) && value.length > 0) {
        conditions.push(
          sql`${products.attributes}->>${key} IN (${sql.join(
            value.map((v) => sql`${v}`),
            sql`, `,
          )})`,
        );
      }
    }
  }

  return and(...(conditions.filter(Boolean) as SQL[]));
};

/**
 * Find products with pagination and filtering
 *
 * Uses PostgreSQL DISTINCT ON for deduplication by productGroupId.
 * This ensures one product per group while maintaining sort order.
 *
 * @param options Query options (categorySlug, collectionSlug, sort, page, limit)
 * @param filters Optional price/attribute/brand filters
 */
export const findProducts = async (
  options: ProductListQueryOptions,
  filters?: ProductFilters,
): Promise<FindProductsResult> => {
  const {
    categorySlug,
    collectionSlug,
    sort = "newest",
    page = 1,
    limit = 12,
  } = options;
  const offset = (page - 1) * limit;

  // Build WHERE conditions using Drizzle
  const whereCondition = buildFilterConditionsForQuery(
    categorySlug,
    collectionSlug,
    filters,
  );

  // Build ORDER BY clause
  const orderByClause = buildOrderByClause(sort);

  // Main query: Use selectDistinctOn for deduplication
  // PostgreSQL DISTINCT ON requires the distinct column to be first in ORDER BY
  const productRows = await db
    .selectDistinctOn([products.productGroupId], {
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      sku: products.sku,
      price: products.price,
      discountedPrice: products.discountedPrice,
      images: products.images,
      productGroupId: products.productGroupId,
      createdAt: products.createdAt,
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(whereCondition)
    .orderBy(products.productGroupId, orderByClause)
    .offset(offset)
    .limit(limit);

  // Count query: Count distinct product groups
  const countResult = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${products.productGroupId})`,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(whereCondition);

  // Map to response format
  const mappedProducts: ProductListItem[] = productRows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sku: row.sku,
    price: row.price,
    discountedPrice: row.discountedPrice,
    images: row.images as string[],
    productGroupId: row.productGroupId,
    brand: row.brandId
      ? {
          id: row.brandId,
          name: row.brandName!,
          slug: row.brandSlug!,
        }
      : null,
  }));

  const total = Number(countResult[0]?.count ?? 0);

  return { products: mappedProducts, total };
};

interface SearchProductsOptions {
  query: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

/**
 * Search products using PostgreSQL full-text search
 *
 * Uses a CTE to first deduplicate by productGroupId with DISTINCT ON,
 * then applies relevance-based ordering in the outer query.
 * This is necessary because DISTINCT ON requires the distinct column
 * to be first in ORDER BY, which conflicts with relevance sorting.
 */
export const searchProducts = async (
  options: SearchProductsOptions,
  filters?: ProductFilters,
): Promise<FindProductsResult> => {
  const { query, sort = "relevance", page = 1, limit = 12 } = options;
  const offset = (page - 1) * limit;

  // Build search-specific conditions
  const searchCondition = buildSearchCondition(query);
  const rankExpression = buildSearchRankExpression(query);

  // Build filter conditions (reuse existing filter logic)
  const filterConditions: (SQL | undefined)[] = [
    eq(products.isActive, true),
    searchCondition,
  ];

  if (filters) {
    const priceConditions = buildPriceConditions(filters);
    filterConditions.push(...priceConditions);
  }

  if (filters?.brandSlugs && filters.brandSlugs.length > 0) {
    filterConditions.push(inArray(brands.slug, filters.brandSlugs));
  }

  // Dynamic attribute filters (JSONB)
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (key === "minPrice" || key === "maxPrice" || key === "brandSlugs")
        continue;
      if (Array.isArray(value) && value.length > 0) {
        filterConditions.push(
          sql`${products.attributes}->>${key} IN (${sql.join(
            value.map((v) => sql`${v}`),
            sql`, `,
          )})`,
        );
      }
    }
  }

  const whereCondition = and(...(filterConditions.filter(Boolean) as SQL[]));

  // Determine ORDER BY for the outer query
  const outerOrderBy =
    sort === "relevance" ? sql`rank DESC` : buildOrderByClause(sort);

  // CTE approach: deduplicate first, then sort by relevance
  // Step 1: Get deduplicated rows with rank
  // Note: No table aliases used so Drizzle's generated "products"/"brands" references work
  const deduplicatedRows = await db.execute(sql`
    WITH deduplicated AS (
      SELECT DISTINCT ON ("products"."product_group_id")
        "products"."id",
        "products"."name",
        "products"."slug",
        "products"."description",
        "products"."sku",
        "products"."price",
        "products"."discounted_price",
        "products"."images",
        "products"."product_group_id",
        "products"."created_at",
        "brands"."id" AS "brand_id",
        "brands"."name" AS "brand_name",
        "brands"."slug" AS "brand_slug",
        ${rankExpression} AS rank
      FROM "products"
      LEFT JOIN "brands" ON "products"."brand_id" = "brands"."id"
      WHERE ${whereCondition}
      ORDER BY "products"."product_group_id", ${rankExpression} DESC
    )
    SELECT * FROM deduplicated
    ORDER BY ${outerOrderBy}
    LIMIT ${limit} OFFSET ${offset}
  `);

  // Step 2: Count distinct product groups
  const countResult = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${products.productGroupId})`,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(whereCondition);

  // Map to response format
  const mappedProducts: ProductListItem[] = (deduplicatedRows as any[]).map(
    (row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      sku: row.sku,
      price: row.price,
      discountedPrice: row.discounted_price,
      images: row.images,
      productGroupId: row.product_group_id,
      brand: row.brand_id
        ? {
            id: row.brand_id,
            name: row.brand_name,
            slug: row.brand_slug,
          }
        : null,
    }),
  );

  const total = Number(countResult[0]?.count ?? 0);

  return { products: mappedProducts, total };
};

/** Strip variant suffix from product name: "MacBook Air M3 - Midnight" → "MacBook Air M3" */
const stripVariantSuffix = (name: string): string => {
  const idx = name.lastIndexOf(" - ");
  return idx > 0 ? name.substring(0, idx).trim() : name;
};

/**
 * Get keyword-based search suggestions using prefix matching
 *
 * Returns three types of suggestions (prioritized in this order):
 * 1. Brand names — only if the brand name contains the typed query
 * 2. Category names — only if the category name contains the typed query
 * 3. Product keywords — variant suffix stripped, deduplicated by base name
 *
 * All suggestions navigate to search results, giving broader matches
 * than the old product-name-only approach.
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 8,
): Promise<SearchSuggestion[]> => {
  const prefixCondition = buildPrefixSearchCondition(query);
  const rankExpression = buildSearchRankExpression(query);
  const queryLower = query.toLowerCase().trim();

  // Fetch more rows than needed — deduplication will reduce the count
  const result = await db
    .selectDistinctOn([products.productGroupId], {
      productName: products.name,
      productSlug: products.slug,
      brandName: brands.name,
      brandSlug: brands.slug,
      categoryName: categories.name,
      categorySlug: categories.slug,
      rank: rankExpression,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isActive, true), prefixCondition))
    .orderBy(products.productGroupId, sql`${rankExpression} DESC`)
    .limit(limit * 3);

  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  // 1. Brand suggestions (only when brand name matches the typed query)
  for (const row of result) {
    if (!row.brandName || !row.brandSlug) continue;
    const key = row.brandName.toLowerCase();
    if (seen.has(key) || !key.includes(queryLower)) continue;
    seen.add(key);
    suggestions.push({ text: row.brandName, type: "brand", slug: row.brandSlug });
  }

  // 2. Category suggestions (only when category name matches the typed query)
  for (const row of result) {
    if (!row.categoryName || !row.categorySlug) continue;
    const key = row.categoryName.toLowerCase();
    if (seen.has(key) || !key.includes(queryLower)) continue;
    seen.add(key);
    suggestions.push({ text: row.categoryName, type: "category", slug: row.categorySlug });
  }

  // 3. Keyword suggestions: extract common product name prefixes
  //    If 2+ product groups share a prefix, it's a useful broad keyword
  const prefixCounts = new Map<string, number>();
  for (const row of result) {
    const baseName = stripVariantSuffix(row.productName);
    const words = baseName.split(/\s+/);

    for (let i = 1; i <= words.length; i++) {
      const prefix = words.slice(0, i).join(" ");
      if (!prefix.toLowerCase().includes(queryLower)) continue;
      prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
    }
  }

  // Broad keywords: prefixes matching 2+ product groups, shortest (broadest) first
  const broadKeywords = [...prefixCounts.entries()]
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => a[0].length - b[0].length);

  if (broadKeywords.length > 0) {
    for (const [keyword] of broadKeywords) {
      const key = keyword.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push({
        text: keyword,
        type: "product",
        slug: key.replace(/\s+/g, "-"),
      });
    }
  } else {
    // Fallback: specific product names when no common prefixes found
    for (const row of result) {
      const simplified = stripVariantSuffix(row.productName);
      const key = simplified.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push({ text: simplified, type: "product", slug: row.productSlug });
    }
  }

  return suggestions.slice(0, limit);
};

// ============================================================================
// Filter Options Repository
// ============================================================================

export interface RawFilterData {
  productGroupId: string;
  price: string;
  brandId: number | null;
  brandName: string | null;
  brandSlug: string | null;
  attributes: Record<string, unknown>;
  categoryName: string | null;
  categorySlug: string | null;
  parentCategoryName: string | null;
  parentCategorySlug: string | null;
}

/**
 * Get filter options for products matching criteria
 *
 * Uses DISTINCT ON productGroupId to ensure one product per group,
 * avoiding variant duplication in filter counts.
 */
export const getFilterOptions = async (
  categorySlug?: string,
  collectionSlug?: string,
  searchQuery?: string,
): Promise<RawFilterData[]> => {
  const baseCondition = buildBaseConditions(categorySlug, collectionSlug);
  const parentCategories = aliasedTable(categories, "parent_categories");

  // Add search condition if search query is provided
  const whereCondition = searchQuery
    ? and(baseCondition, buildSearchCondition(searchQuery))
    : baseCondition;

  const result = await db
    .selectDistinctOn([products.productGroupId], {
      productGroupId: products.productGroupId,
      price: products.price,
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
      attributes: products.attributes,
      categoryName: categories.name,
      categorySlug: categories.slug,
      parentCategoryName: parentCategories.name,
      parentCategorySlug: parentCategories.slug,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
    .where(whereCondition)
    .orderBy(products.productGroupId, desc(products.createdAt));

  return result;
};

// ============================================================================
// Product Detail Repository
// ============================================================================

/**
 * Find a single product by slug with category and brand info
 *
 * Single query with JOINs - no N+1 problem
 */
export const findProductBySlug = async (
  slug: string,
): Promise<ProductWithRelations | null> => {
  const result = await db
    .select({
      // Product fields
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      sku: products.sku,
      price: products.price,
      discountedPrice: products.discountedPrice,
      stock: products.stock,
      images: products.images,
      attributes: products.attributes,
      productGroupId: products.productGroupId,
      categoryId: products.categoryId,
      brandId: products.brandId,
      vendorId: products.vendorId,
      categoryPath: products.categoryPath,
      collectionSlugs: products.collectionSlugs,
      metaTitle: products.metaTitle,
      metaDescription: products.metaDescription,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      featuredOrder: products.featuredOrder,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      // Category fields (nested)
      categoryIdJoin: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      // Brand fields (nested)
      brandIdJoin: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
      brandLogo: brands.logo,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  const row = result[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sku: row.sku,
    price: row.price,
    discountedPrice: row.discountedPrice,
    stock: row.stock,
    images: row.images as string[],
    attributes: row.attributes as Record<string, unknown>,
    productGroupId: row.productGroupId,
    categoryId: row.categoryId,
    brandId: row.brandId,
    vendorId: row.vendorId,
    categoryPath: row.categoryPath,
    collectionSlugs: row.collectionSlugs as string[],
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    featuredOrder: row.featuredOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.categoryIdJoin
      ? {
          id: row.categoryIdJoin,
          name: row.categoryName!,
          slug: row.categorySlug!,
        }
      : null,
    brand: row.brandIdJoin
      ? {
          id: row.brandIdJoin,
          name: row.brandName!,
          slug: row.brandSlug!,
          logo: row.brandLogo,
        }
      : null,
  };
};

/**
 * Find all variants of a product by productGroupId
 *
 * Single query - returns all variants in one go
 */
export const findVariantsByGroupId = async (
  productGroupId: string,
): Promise<ProductVariant[]> => {
  const result = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      price: products.price,
      discountedPrice: products.discountedPrice,
      stock: products.stock,
      images: products.images,
      attributes: products.attributes,
      isActive: products.isActive,
    })
    .from(products)
    .where(
      and(
        eq(products.productGroupId, productGroupId),
        eq(products.isActive, true),
      ),
    )
    .orderBy(asc(products.id));

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    price: row.price,
    discountedPrice: row.discountedPrice,
    stock: row.stock,
    images: row.images as string[],
    attributes: row.attributes as Record<string, unknown>,
    isActive: row.isActive,
  }));
};

// ============================================================================
// Featured Products Repository
// ============================================================================

/**
 * Find featured products
 *
 * Simple query with optional limit
 */
export const findFeaturedProducts = async (
  limit: number = 8,
): Promise<ProductListItem[]> => {
  const result = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      sku: products.sku,
      price: products.price,
      discountedPrice: products.discountedPrice,
      images: products.images,
      productGroupId: products.productGroupId,
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(asc(products.featuredOrder))
    .limit(limit);

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sku: row.sku,
    price: row.price,
    discountedPrice: row.discountedPrice,
    images: row.images as string[],
    productGroupId: row.productGroupId,
    brand: row.brandId
      ? {
          id: row.brandId,
          name: row.brandName!,
          slug: row.brandSlug!,
        }
      : null,
  }));
};

// ============================================================================
// Batch Product Queries
// ============================================================================

/**
 * Find multiple products by IDs in a single query
 * Avoids N+1 query problem when fetching cart items
 * Returns products in the same order as input IDs (when possible)
 */
export const findProductsByIds = async (ids: number[]): Promise<Product[]> => {
  if (ids.length === 0) {
    return [];
  }

  const result = await db
    .select()
    .from(products)
    .where(sql`${products.id} = ANY(${sql.raw(`ARRAY[${ids.join(",")}]`)})`);

  // Create a map for O(1) lookup
  const productMap = new Map(result.map((p) => [p.id, p]));

  // Return products in the same order as input IDs (preserve order when fetching for cart)
  return ids
    .map((id) => productMap.get(id))
    .filter((p): p is (typeof result)[0] => p !== undefined);
};

/**
 * Find multiple products by SKUs in a single query
 * Avoids N+1 query problem when validating checkout items
 * Used for guest checkout cart validation
 */
export const findProductsBySkus = async (
  skus: string[],
): Promise<Product[]> => {
  if (skus.length === 0) {
    return [];
  }

  return await db
    .select()
    .from(products)
    .where(
      sql`${products.sku} = ANY(${sql.raw(`ARRAY[${skus.map((s) => `'${s}'`).join(",")}]`)})`,
    );
};
