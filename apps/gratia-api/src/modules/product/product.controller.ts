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

// Helper function to ensure string type from params
const ensureString = (
  value: string | string[] | undefined,
): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return undefined;
};

// Helper function to ensure string type from query
const ensureStringFromQuery = (value: unknown): string | undefined => {
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
 * Query params:
 * - categorySlug: Filter by category
 * - collectionSlug: Filter by collection
 * - sort: "newest" | "price-low" | "price-high" | "name"
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 100)
 * - filters[minPrice]: Minimum price
 * - filters[maxPrice]: Maximum price
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

/**
 * GET /api/v2/products/category/:categorySlug
 *
 * Shorthand endpoint for fetching products by category
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const categorySlug = ensureString(req.params.categorySlug);
    const baseOptions = parseProductListQuery(
      req.query as Record<string, unknown>,
    );
    const filters = parseProductFilters(req.query as Record<string, unknown>);

    const options = { ...baseOptions, categorySlug };
    const result = await getProductList(options, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
};

/**
 * GET /api/v2/products/collection/:collectionSlug
 *
 * Shorthand endpoint for fetching products by collection
 */
export const getProductsByCollection = async (req: Request, res: Response) => {
  try {
    const collectionSlug = ensureString(req.params.collectionSlug);
    const baseOptions = parseProductListQuery(
      req.query as Record<string, unknown>,
    );
    const filters = parseProductFilters(req.query as Record<string, unknown>);

    const options = { ...baseOptions, collectionSlug };
    const result = await getProductList(options, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching products by collection:", error);
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
 * Get available filter options for products matching criteria
 *
 * Query params:
 * - categorySlug: Filter by category
 * - collectionSlug: Filter by collection
 *
 * Returns:
 * - priceRange: { min, max }
 * - brands: [{ value, count }]
 * - attributes: [{ key, label, type, values: [{ value, count }] }]
 */
export const getFilters = async (req: Request, res: Response) => {
  try {
    const categorySlug = ensureStringFromQuery(req.query.categorySlug);
    const collectionSlug = ensureStringFromQuery(req.query.collectionSlug);

    const result = await getFilterOptionsForProducts(
      categorySlug,
      collectionSlug,
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

/**
 * GET /api/v2/products/category/:categorySlug/filters
 *
 * Get filter options for a specific category
 */
export const getFiltersByCategory = async (req: Request, res: Response) => {
  try {
    const categorySlug = ensureString(req.params.categorySlug);

    const result = await getFilterOptionsForProducts(categorySlug);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching category filter options:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch filter options",
    });
  }
};

/**
 * GET /api/v2/products/collection/:collectionSlug/filters
 *
 * Get filter options for a specific collection
 */
export const getFiltersByCollection = async (req: Request, res: Response) => {
  try {
    const collectionSlug = ensureString(req.params.collectionSlug);

    const result = await getFilterOptionsForProducts(undefined, collectionSlug);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching collection filter options:", error);
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
