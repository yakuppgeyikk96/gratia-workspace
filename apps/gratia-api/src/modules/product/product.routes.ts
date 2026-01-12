import { Router } from "express";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middlewares/validation.middleware";
import {
  createProductController,
  getFeaturedProductsController,
  getProductByIdController,
  getProductsController,
  getProductWithVariantsController,
} from "./product.controller";
import {
  createProductSchema,
  getFeaturedProductsQuerySchema,
  getProductByIdParamsSchema,
  getProductByIdQuerySchema,
  getProductsQuerySchema,
  getProductWithVariantsParamsSchema,
} from "./product.validations";

const router: Router = Router();

// POST /api/products - Create product
router.post("/", validateBody(createProductSchema), createProductController);

// GET /api/products/featured - Get featured products
router.get(
  "/featured",
  validateQuery(getFeaturedProductsQuerySchema),
  getFeaturedProductsController
);

// GET /api/products - Get products
router.get(
  "/",
  validateQuery(getProductsQuerySchema),
  getProductsController
);

// GET /api/products/:slug/with-variants - Get product with variants
router.get(
  "/:slug/with-variants",
  validateParams(getProductWithVariantsParamsSchema),
  getProductWithVariantsController
);

// GET /api/products/:id - Get product by ID
router.get(
  "/:id",
  validateParams(getProductByIdParamsSchema),
  validateQuery(getProductByIdQuerySchema),
  getProductByIdController
);

export default router;
