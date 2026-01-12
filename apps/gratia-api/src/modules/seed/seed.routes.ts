import { Router } from "express";
import { seedVendorCategoriesProductsController } from "./seed.controller";

const router: Router = Router();

// Seed endpoint
router.post(
  "/vendor-categories-products",
  seedVendorCategoriesProductsController
);

export default router;
