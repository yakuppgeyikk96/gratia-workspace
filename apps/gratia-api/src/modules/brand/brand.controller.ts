import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { StatusCode } from "../../shared/types";
import { getIdParam, getStringParam } from "../../shared/utils/params.utils";
import { returnSuccess } from "../../shared/utils/response.utils";
import {
  createBrandService,
  getActiveBrandsService,
  getBrandByIdService,
  getBrandBySlugService,
  getBrandsService,
  updateBrandService,
} from "./brand.service";
import type { CreateBrandDto } from "./brand.validations";

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
    const brandId = getIdParam(req.params.id, "Brand ID");
    const result = await getBrandByIdService(brandId);

    returnSuccess(res, result, "Brand found", StatusCode.SUCCESS);
  }
);

export const getBrandBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const slug = getStringParam(req.params.slug, "Brand slug");
    const result = await getBrandBySlugService(slug);

    returnSuccess(res, result, "Brand found", StatusCode.SUCCESS);
  }
);

export const updateBrandController = asyncHandler(
  async (req: Request, res: Response) => {
    const brandId = getIdParam(req.params.id, "Brand ID");
    const payload = req.body;
    const result = await updateBrandService(brandId, payload);

    returnSuccess(
      res,
      result,
      "Brand updated successfully",
      StatusCode.SUCCESS
    );
  }
);
