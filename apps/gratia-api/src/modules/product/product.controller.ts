import type { Request, Response } from "express";
import {
  getFeaturedProducts,
  getFilterOptionsForProducts,
  getProductDetail,
  getProductList,
} from "./product.service";
import {
  parseProductFilters,
  parseProductListQuery,
} from "./utils/filter.utils";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Ensures a value is a string, handling arrays and unknowns
 */
const ensureString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return String(value[0]);
  return undefined;
};

// ============================================================================
// Product List Controller
// ============================================================================

/**
 * GET /api/v2/products
 *
 * Unified endpoint for fetching products with filtering and pagination.
 *
 * Query params:
 * - categorySlug: Filter by category
 * - collectionSlug: Filter by collection
 * - sort: "newest" | "price-low" | "price-high" | "name"
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 100)
 * - filters[minPrice]: Minimum price
 * - filters[maxPrice]: Maximum price
 * - filters[brandSlugs]: Comma-separated brand slugs
 * - filters[attributeKey]: Comma-separated attribute values
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const options = parseProductListQuery(req.query as Record<string, unknown>);
    const filters = parseProductFilters(req.query as Record<string, unknown>);

    const result = await getProductList(options, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
};

// ============================================================================
// Filter Options Controller
// ============================================================================

/**
 * GET /api/v2/products/filters
 *
 * Get available filter options for products matching criteria.
 * Supports faceted search - counts are calculated with other filters applied.
 *
 * Query params:
 * - categorySlug: Filter by category
 * - collectionSlug: Filter by collection
 * - filters[...]: Active filters for faceted count calculation
 *
 * Returns:
 * - priceRange: { min, max }
 * - brands: [{ value, count }]
 * - attributes: [{ key, label, type, values: [{ value, count }] }]
 * - categories: [{ value, label, count, parentSlug, parentLabel }]
 */
export const getFilters = async (req: Request, res: Response) => {
  try {
    const categorySlug = ensureString(req.query.categorySlug);
    const collectionSlug = ensureString(req.query.collectionSlug);
    const activeFilters = parseProductFilters(req.query as Record<string, unknown>);

    const result = await getFilterOptionsForProducts(
      categorySlug,
      collectionSlug,
      activeFilters
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch filter options",
    });
  }
};

// ============================================================================
// Product Detail Controller
// ============================================================================

/**
 * GET /api/v2/products/:slug
 *
 * Get product detail with variants and available options
 */
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const slug = ensureString(req.params.slug);

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: "Product slug is required",
      });
    }

    const result = await getProductDetail(slug);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
};

// ============================================================================
// Featured Products Controller
// ============================================================================

/**
 * GET /api/v2/products/featured
 *
 * Get featured products
 *
 * Query params:
 * - limit: Number of products (default: 8, max: 20)
 */
export const getFeatured = async (req: Request, res: Response) => {
  try {
    const limitParam = Number(req.query.limit);
    const limit = isNaN(limitParam) ? 8 : Math.min(20, Math.max(1, limitParam));

    const result = await getFeaturedProducts(limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch featured products",
    });
  }
};
