import { Router } from "express";
import { validateBody } from "../../shared/middlewares";
import {
  createVendorController,
  getActiveVendorsController,
  getAllVendorsController,
  getVendorByIdController,
  getVendorBySlugController,
  updateVendorController,
} from "./vendor.controller";
import { createVendorSchema, updateVendorSchema } from "./vendor.validations";

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

// Update vendor
router.put("/:id", validateBody(updateVendorSchema), updateVendorController);

export default router;
