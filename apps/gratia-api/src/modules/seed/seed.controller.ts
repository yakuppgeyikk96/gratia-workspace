import { Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { seedVendorCategoriesProductsService } from "./seed.service";

/**
 * Seed vendor, categories, and products
 * POST /api/seed/vendor-categories-products
 */
export const seedVendorCategoriesProductsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const result = await seedVendorCategoriesProductsService();

    returnSuccess(
      res,
      result,
      "Seed data created successfully",
      StatusCode.CREATED
    );
  }
);
