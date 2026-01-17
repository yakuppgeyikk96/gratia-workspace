import { Router } from "express";
import {
  seedComprehensiveController,
  seedVendorCategoriesProductsController,
} from "./seed.controller";

const router: Router = Router();

// Seed endpoint
router.post(
  "/vendor-categories-products",
  seedVendorCategoriesProductsController
);

router.post("/comprehensive", seedComprehensiveController);

export default router;
