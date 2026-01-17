import { Router } from "express";
import {
  getProducts,
  getProductsByCategory,
  getProductsByCollection,
  getFilters,
  getFiltersByCategory,
  getFiltersByCollection,
  getProductBySlug,
  getFeatured,
} from "./productV2.controller";

const router = Router();

// ============================================================================
// Product List Routes
// ============================================================================

// GET /api/v2/products - Main product listing with query params
router.get("/", getProducts);

// GET /api/v2/products/featured - Featured products
router.get("/featured", getFeatured);

// GET /api/v2/products/filters - Filter options for all products
router.get("/filters", getFilters);

// ============================================================================
// Category Routes
// ============================================================================

// GET /api/v2/products/category/:categorySlug - Products by category
router.get("/category/:categorySlug", getProductsByCategory);

// GET /api/v2/products/category/:categorySlug/filters - Filter options for category
router.get("/category/:categorySlug/filters", getFiltersByCategory);

// ============================================================================
// Collection Routes
// ============================================================================

// GET /api/v2/products/collection/:collectionSlug - Products by collection
router.get("/collection/:collectionSlug", getProductsByCollection);

// GET /api/v2/products/collection/:collectionSlug/filters - Filter options for collection
router.get("/collection/:collectionSlug/filters", getFiltersByCollection);

// ============================================================================
// Product Detail Route
// ============================================================================

// GET /api/v2/products/:slug - Product detail with variants
// Note: This must be last to avoid catching other routes
router.get("/:slug", getProductBySlug);

export default router;
