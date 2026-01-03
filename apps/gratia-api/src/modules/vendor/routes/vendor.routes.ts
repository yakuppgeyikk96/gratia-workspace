import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import {
  createVendorController,
  getActiveVendorsController,
  getAllVendorsController,
  getVendorByIdController,
  getVendorBySlugController,
} from "../controllers";
import { createVendorSchema } from "../validations";

const router: Router = Router();

// Create vendor (manual for now, will be restricted to admin later)
router.post("/", validateBody(createVendorSchema), createVendorController);

// Get all vendors
router.get("/", getAllVendorsController);

// Get active vendors
router.get("/active", getActiveVendorsController);

// Get vendor by ID
router.get("/:id", getVendorByIdController);

// Get vendor by slug
router.get("/slug/:slug", getVendorBySlugController);

export default router;