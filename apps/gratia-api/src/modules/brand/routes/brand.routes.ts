import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import {
  createBrandController,
  getActiveBrandsController,
  getAllBrandsController,
  getBrandByIdController,
  getBrandBySlugController,
} from "../controllers";
import { createBrandSchema } from "../validations";

const router: Router = Router();

// Create brand (manual for now, will be restricted to admin later)
router.post("/", validateBody(createBrandSchema), createBrandController);

// Get all brands
router.get("/", getAllBrandsController);

// Get active brands
router.get("/active", getActiveBrandsController);

// Get brand by ID
router.get("/:id", getBrandByIdController);

// Get brand by slug
router.get("/slug/:slug", getBrandBySlugController);

export default router;