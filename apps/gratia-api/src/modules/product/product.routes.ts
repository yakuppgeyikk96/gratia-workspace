import { Router, type IRouter } from "express";
import {
  getProducts,
  getFilters,
  getProductBySlug,
  getFeatured,
  searchProductsHandler,
  getSearchSuggestionsHandler,
} from "./product.controller";

const router: IRouter = Router();

// ============================================================================
// Product Routes
// ============================================================================

// GET /api/v2/products - Main product listing with query params
// Supports: categorySlug, collectionSlug, sort, page, limit, filters[...]
router.get("/", getProducts);

// GET /api/v2/products/featured - Featured products
router.get("/featured", getFeatured);

// GET /api/v2/products/filters - Filter options
// Supports: categorySlug, collectionSlug, q query params
router.get("/filters", getFilters);

// GET /api/v2/products/search - Full-text product search
// Supports: q, sort, page, limit, filters[...]
router.get("/search", searchProductsHandler);

// GET /api/v2/products/search/suggestions - Autocomplete suggestions
// Supports: q, limit
router.get("/search/suggestions", getSearchSuggestionsHandler);

// GET /api/v2/products/:slug - Product detail with variants
// Note: This must be last to avoid catching other routes
router.get("/:slug", getProductBySlug);

export default router;
