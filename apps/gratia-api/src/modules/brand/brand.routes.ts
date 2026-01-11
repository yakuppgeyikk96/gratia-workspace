import { Router } from "express";
import { validateBody } from "../../shared/middlewares/validation.middleware";
import {
  createBrandController,
  getActiveBrandsController,
  getAllBrandsController,
  getBrandByIdController,
  getBrandBySlugController,
  updateBrandController,
} from "./brand.controller";
import { createBrandSchema } from "./brand.validations";

const router: Router = Router();

// Create brand
router.post("/", validateBody(createBrandSchema), createBrandController);

// Get all brands
router.get("/", getAllBrandsController);

// Get active brands
router.get("/active", getActiveBrandsController);

// Get brand by ID
router.get("/:id", getBrandByIdController);

// Get brand by slug
router.get("/slug/:slug", getBrandBySlugController);

// Update brand
router.put(
  "/:id",
  validateBody(createBrandSchema.partial()),
  updateBrandController
);

export default router;
