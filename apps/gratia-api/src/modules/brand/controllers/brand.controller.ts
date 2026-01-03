import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { asyncHandler } from "../../../shared/middlewares";
import { StatusCode } from "../../../shared/types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import {
  createBrandService,
  getActiveBrandsService,
  getBrandByIdService,
  getBrandBySlugService,
  getBrandsService,
} from "../services";
import { CreateBrandDto } from "../validations";

export const createBrandController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: CreateBrandDto = req.body;

    const result = await createBrandService(payload);

    returnSuccess(res, result, "Brand created successfully", StatusCode.CREATED);
  }
);

export const getAllBrandsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getBrandsService();

    returnSuccess(res, result, "Brands found", StatusCode.SUCCESS);
  }
);

export const getActiveBrandsController = asyncHandler(
  async (req: Request, res: Response) => {
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

    const result = await getBrandByIdService(id);

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