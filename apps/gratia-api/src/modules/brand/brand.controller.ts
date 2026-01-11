import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { asyncHandler } from "../../shared/middlewares";
import { StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { BRAND_MESSAGES } from "./brand.constants";
import {
  createBrandService,
  getActiveBrandsService,
  getBrandByIdService,
  getBrandBySlugService,
  getBrandsService,
  updateBrandService,
} from "./brand.service";
import type { CreateBrandDto } from "./brand.validations";

const parseId = (id: string): number => {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) {
    throw new AppError(BRAND_MESSAGES.BRAND_NOT_FOUND, ErrorCode.BAD_REQUEST);
  }
  return parsed;
};

export const createBrandController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: CreateBrandDto = req.body;

    const result = await createBrandService(payload);

    returnSuccess(
      res,
      result,
      "Brand created successfully",
      StatusCode.CREATED
    );
  }
);

export const getAllBrandsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await getBrandsService();

    returnSuccess(res, result, "Brands found", StatusCode.SUCCESS);
  }
);

export const getActiveBrandsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await getActiveBrandsService();

    returnSuccess(res, result, "Active brands found", StatusCode.SUCCESS);
  }
);

export const getBrandByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Brand ID is required", ErrorCode.BAD_REQUEST);
    }

    const brandId = parseId(id);
    const result = await getBrandByIdService(brandId);

    returnSuccess(res, result, "Brand found", StatusCode.SUCCESS);
  }
);

export const getBrandBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
      throw new AppError("Brand slug is required", ErrorCode.BAD_REQUEST);
    }

    const result = await getBrandBySlugService(slug);

    returnSuccess(res, result, "Brand found", StatusCode.SUCCESS);
  }
);

export const updateBrandController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    if (!id) {
      throw new AppError("Brand ID is required", ErrorCode.BAD_REQUEST);
    }

    const brandId = parseId(id);
    const result = await updateBrandService(brandId, payload);

    returnSuccess(
      res,
      result,
      "Brand updated successfully",
      StatusCode.SUCCESS
    );
  }
);
