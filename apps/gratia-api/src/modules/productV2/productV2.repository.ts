import { db } from "../../config/postgres.config";
import { products } from "../../db/schema/product.schema";
import { brands } from "../../db/schema/brand.schema";
import { categories } from "../../db/schema/category.schema";
import { eq, sql, and, asc } from "drizzle-orm";
import {
  buildBaseConditions,
  buildOrderByClause,
  buildPriceConditions,
} from "./utils/query-builder.utils";
import type {
  ProductListQueryOptions,
  ProductListItem,
  ProductFilters,
  ProductVariant,
  ProductWithRelations,
} from "./types";

// ============================================================================
// Product Listing Repository
// ============================================================================

interface FindProductsResult {
  products: ProductListItem[];
  total: number;
}

/**
 * Find products with pagination and filtering
 *
 * Uses a single optimized query with:
 * - DISTINCT ON for product group deduplication
 * - LEFT JOINs for brand info (avoids N+1)
 * - Efficient pagination with OFFSET/LIMIT
 *
 * @param options Query options (categorySlug, collectionSlug, sort, page, limit)
 * @param filters Optional price/attribute filters
 */
export const findProducts = async (
  options: ProductListQueryOptions,
  filters?: ProductFilters
): Promise<FindProductsResult> => {
  const { categorySlug, collectionSlug, sort = "newest", page = 1, limit = 12 } = options;
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  let whereCondition = buildBaseConditions(categorySlug, collectionSlug);

  // Add price filters if provided
  if (filters) {
    const priceConditions = buildPriceConditions(filters);
    if (priceConditions.length > 0) {
      whereCondition = and(whereCondition, ...priceConditions);
    }
  }

  // Build ORDER BY - productGroupId must be first for DISTINCT ON
  const sortClause = buildOrderByClause(sort);

  // Single query: Get distinct products per group with brand info
  // Uses subquery approach to avoid DISTINCT ON ordering constraint issues
  const productsQuery = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
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
    .orderBy(asc(products.productGroupId), sortClause)
    .limit(limit * 3); // Fetch extra to handle group deduplication

  // Count query: Get total distinct product groups
  const countQuery = db
    .select({
      count: sql<number>`COUNT(DISTINCT ${products.productGroupId})`,
    })
    .from(products)
    .where(whereCondition);

  // Execute both queries in parallel
  const [productRows, countResult] = await Promise.all([productsQuery, countQuery]);

  // Deduplicate by productGroupId in memory (O(n) with Map)
  const seenGroups = new Map<string, typeof productRows[0]>();
  for (const row of productRows) {
    if (!seenGroups.has(row.productGroupId)) {
      seenGroups.set(row.productGroupId, row);
    }
  }

  // Convert to array and apply pagination
  const uniqueProducts = Array.from(seenGroups.values());

  // Sort the unique products according to the sort option
  const sortedProducts = sortUniqueProducts(uniqueProducts, sort);

  // Apply pagination
  const paginatedProducts = sortedProducts.slice(offset, offset + limit);

  // Map to response format
  const mappedProducts: ProductListItem[] = paginatedProducts.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
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

/**
 * Sort unique products based on sort option
 */
const sortUniqueProducts = <T extends { price: string; name: string; createdAt: Date }>(
  products: T[],
  sort: string
): T[] => {
  const sorted = [...products];

  switch (sort) {
    case "price-low":
      return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    case "price-high":
      return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
};

// ============================================================================
// Filter Options Repository
// ============================================================================

interface RawFilterData {
  price: string;
  brandId: number | null;
  brandName: string | null;
  brandSlug: string | null;
  attributes: Record<string, any>;
}

/**
 * Get filter options for products matching criteria
 *
 * Fetches minimal data needed for building filters:
 * - Price range (min/max)
 * - Available brands with counts
 * - Available attribute values with counts (for future use)
 *
 * Uses a single query with brand JOIN.
 */
export const getFilterOptions = async (
  categorySlug?: string,
  collectionSlug?: string
): Promise<RawFilterData[]> => {
  const whereCondition = buildBaseConditions(categorySlug, collectionSlug);

  const result = await db
    .select({
      price: products.price,
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
      attributes: products.attributes,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(whereCondition);

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
  slug: string
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
    attributes: row.attributes as Record<string, any>,
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
  productGroupId: string
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
      and(eq(products.productGroupId, productGroupId), eq(products.isActive, true))
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
    attributes: row.attributes as Record<string, any>,
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
  limit: number = 8
): Promise<ProductListItem[]> => {
  const result = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
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
