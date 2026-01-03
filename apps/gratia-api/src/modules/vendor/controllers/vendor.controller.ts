import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { asyncHandler } from "../../../shared/middlewares";
import { StatusCode } from "../../../shared/types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { VENDOR_MESSAGES } from "../constants";
import {
  createVendorService,
  getActiveVendorsService,
  getVendorByIdService,
  getVendorBySlugService,
  getVendorsService,
} from "../services";
import { CreateVendorDto } from "../validations";

export const createVendorController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: CreateVendorDto = req.body;

    const result = await createVendorService(payload);

    returnSuccess(
      res,
      result,
      "Vendor created successfully",
      StatusCode.CREATED
    );
  }
);

export const getAllVendorsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getVendorsService();

    returnSuccess(res, result, "Vendors found", StatusCode.SUCCESS);
  }
);

export const getActiveVendorsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getActiveVendorsService();

    returnSuccess(res, result, "Active vendors found", StatusCode.SUCCESS);
  }
);

export const getVendorByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Vendor ID is required", ErrorCode.BAD_REQUEST);
    }

    const result = await getVendorByIdService(id);

    returnSuccess(res, result, "Vendor found", StatusCode.SUCCESS);
  }
);

export const getVendorBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
      throw new AppError("Vendor slug is required", ErrorCode.BAD_REQUEST);
    }

    const result = await getVendorBySlugService(slug);

    returnSuccess(res, result, "Vendor found", StatusCode.SUCCESS);
  }
);