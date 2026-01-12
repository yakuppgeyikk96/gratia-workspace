import { Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { getIdParam, getStringParam } from "../../shared/utils/params.utils";
import {
  createVendorService,
  getActiveVendorsService,
  getVendorByIdService,
  getVendorBySlugService,
  getVendorsService,
  updateVendorService,
} from "./vendor.service";
import type { CreateVendorDto, UpdateVendorDto } from "./vendor.validations";

export const createVendorController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
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
  async (_req: AuthRequest, res: Response) => {
    const result = await getVendorsService();

    returnSuccess(res, result, "Vendors found", StatusCode.SUCCESS);
  }
);

export const getActiveVendorsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const result = await getActiveVendorsService();

    returnSuccess(res, result, "Active vendors found", StatusCode.SUCCESS);
  }
);

export const getVendorByIdController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const vendorId = getIdParam(req.params.id, "vendor ID");
    const result = await getVendorByIdService(vendorId);

    returnSuccess(res, result, "Vendor found", StatusCode.SUCCESS);
  }
);

export const getVendorBySlugController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const slug = getStringParam(req.params.slug, "vendor slug");
    const result = await getVendorBySlugService(slug);

    returnSuccess(res, result, "Vendor found", StatusCode.SUCCESS);
  }
);

export const updateVendorController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const vendorId = getIdParam(req.params.id, "vendor ID");
    const data: UpdateVendorDto = req.body;

    const result = await updateVendorService(vendorId, data);

    returnSuccess(
      res,
      result,
      "Vendor updated successfully",
      StatusCode.SUCCESS
    );
  }
);
