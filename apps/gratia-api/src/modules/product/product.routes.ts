import { Router, type IRouter } from "express";
import {
  getProducts,
  getFilters,
  getProductBySlug,
  getFeatured,
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
// Supports: categorySlug, collectionSlug query params
router.get("/filters", getFilters);

// GET /api/v2/products/:slug - Product detail with variants
// Note: This must be last to avoid catching other routes
router.get("/:slug", getProductBySlug);

export default router;
