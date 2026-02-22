import type { Request, Response } from "express";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { PRODUCT_MESSAGES } from "./product.constants";
import {
  createProductService,
  getFeaturedProducts,
  getFilterOptionsForProducts,
  getProductDetail,
  getProductList,
  getSearchSuggestionsForQuery,
  searchProductList,
} from "./product.service";
import type { CreateProductDto } from "./product.validations";
import {
  parsePagination,
  parseProductFilters,
  parseProductListQuery,
  parseSortOption,
} from "./utils/filter.utils";

/**
 * POST /api/products
 *
 * Create a new product. Requires authentication (vendor).
 */
export const createProductController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const payload: CreateProductDto = req.body;
    const userId = req.user!.userId;

    const result = await createProductService(payload, userId);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCT_CREATED,
      StatusCode.CREATED,
    );
  },
);

/**
 * Ensures a value is a string, handling arrays and unknowns
 */
const ensureString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return String(value[0]);
  return undefined;
};

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
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const options = parseProductListQuery(req.query as Record<string, unknown>);
  const filters = parseProductFilters(req.query as Record<string, unknown>);

  const result = await getProductList(options, filters);

  returnSuccess(
    res,
    result,
    "Products retrieved successfully",
    StatusCode.SUCCESS,
  );
});

/**
 * GET /api/v2/products/filters
 *
 * Get available filter options for products matching criteria.
 * Supports faceted search - counts are calculated with other filters applied.
 *
 * Query params:
 * - categorySlug: Filter by category
 * - collectionSlug: Filter by collection
 * - q: Search query for scoping filter options
 * - filters[...]: Active filters for faceted count calculation
 *
 * Returns:
 * - priceRange: { min, max }
 * - brands: [{ value, count }]
 * - attributes: [{ key, label, type, values: [{ value, count }] }]
 * - categories: [{ value, label, count, parentSlug, parentLabel }]
 */
export const getFilters = asyncHandler(async (req: Request, res: Response) => {
  const categorySlug = ensureString(req.query.categorySlug);
  const collectionSlug = ensureString(req.query.collectionSlug);
  const searchQuery = ensureString(req.query.q);
  const activeFilters = parseProductFilters(
    req.query as Record<string, unknown>,
  );

  const result = await getFilterOptionsForProducts(
    categorySlug,
    collectionSlug,
    activeFilters,
    searchQuery,
  );

  returnSuccess(
    res,
    result,
    "Filter options retrieved successfully",
    StatusCode.SUCCESS,
  );
});

/**
 * GET /api/v2/products/search
 *
 * Full-text search for products with filtering and pagination.
 *
 * Query params:
 * - q: Search query (required, min 2 chars)
 * - sort: "relevance" | "newest" | "price-low" | "price-high" | "name"
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 100)
 * - filters[...]: Same filter params as product listing
 */
export const searchProductsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const q = ensureString(req.query.q);

    if (!q || q.trim().length < 2) {
      throw new AppError(
        "Search query must be at least 2 characters",
        ErrorCode.BAD_REQUEST,
        400,
      );
    }

    const sort = parseSortOption(req.query.sort) ?? "relevance";
    const { page, limit } = parsePagination(
      req.query as Record<string, unknown>,
    );
    const filters = parseProductFilters(req.query as Record<string, unknown>);

    const result = await searchProductList(q, sort, page, limit, filters);

    returnSuccess(
      res,
      result,
      "Search results retrieved successfully",
      StatusCode.SUCCESS,
    );
  },
);

/**
 * GET /api/v2/products/search/suggestions
 *
 * Get autocomplete suggestions for search input.
 *
 * Query params:
 * - q: Search query (required, min 2 chars)
 * - limit: Max suggestions (default: 8, max: 20)
 */
export const getSearchSuggestionsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const q = ensureString(req.query.q);

    if (!q || q.trim().length < 2) {
      returnSuccess(
        res,
        { suggestions: [] },
        "No suggestions",
        StatusCode.SUCCESS,
      );
      return;
    }

    const limitParam = Number(req.query.limit);
    const limit = isNaN(limitParam) ? 8 : Math.min(20, Math.max(1, limitParam));

    const result = await getSearchSuggestionsForQuery(q, limit);

    returnSuccess(
      res,
      result,
      "Suggestions retrieved successfully",
      StatusCode.SUCCESS,
    );
  },
);

/**
 * GET /api/v2/products/:slug
 *
 * Get product detail with variants and available options
 */
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const slug = ensureString(req.params.slug);

    if (!slug) {
      throw new AppError(
        "Product slug is required",
        ErrorCode.BAD_REQUEST,
        400,
      );
    }

    const result = await getProductDetail(slug);

    if (!result) {
      throw new AppError("Product not found", ErrorCode.NOT_FOUND, 404);
    }

    returnSuccess(
      res,
      result,
      "Product retrieved successfully",
      StatusCode.SUCCESS,
    );
  },
);

/**
 * GET /api/v2/products/featured
 *
 * Get featured products
 *
 * Query params:
 * - limit: Number of products (default: 8, max: 20)
 */
export const getFeatured = asyncHandler(async (req: Request, res: Response) => {
  const limitParam = Number(req.query.limit);
  const limit = isNaN(limitParam) ? 8 : Math.min(20, Math.max(1, limitParam));

  const result = await getFeaturedProducts(limit);

  returnSuccess(
    res,
    result,
    "Featured products retrieved successfully",
    StatusCode.SUCCESS,
  );
});
