import { Response } from "express";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { COLLECTION_MESSAGES } from "./collection.constants";
import {
  createCollectionService,
  getActiveCollectionsService,
  getAllCollectionsService,
  getCollectionByIdService,
  getCollectionBySlugService,
  getCollectionsByTypeService,
} from "./collection.service";
import type { CreateCollectionDto } from "./collection.validations";

export const createCollectionController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data: CreateCollectionDto = req.body;

    const collection = await createCollectionService(data);

    returnSuccess(
      res,
      collection,
      COLLECTION_MESSAGES.COLLECTION_CREATED_SUCCESSFULLY,
      StatusCode.CREATED
    );
  }
);

export const getAllCollectionsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const collections = await getAllCollectionsService();

    returnSuccess(
      res,
      collections,
      "Collections retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

export const getActiveCollectionsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const collections = await getActiveCollectionsService();

    returnSuccess(
      res,
      collections,
      "Active collections retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

export const getCollectionByIdController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      throw new AppError(
        COLLECTION_MESSAGES.INVALID_COLLECTION_ID,
        ErrorCode.BAD_REQUEST
      );
    }

    const collection = await getCollectionByIdService(parseInt(id, 10));

    returnSuccess(
      res,
      collection,
      "Collection retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

export const getCollectionBySlugController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
      throw new AppError(
        COLLECTION_MESSAGES.COLLECTION_SLUG_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const collection = await getCollectionBySlugService(slug);

    returnSuccess(
      res,
      collection,
      "Collection retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

export const getCollectionsByTypeController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { type } = req.params;

    if (
      !type ||
      !["new", "trending", "sale", "featured"].includes(
        type as "new" | "trending" | "sale" | "featured"
      )
    ) {
      throw new AppError(
        COLLECTION_MESSAGES.INVALID_COLLECTION_TYPE,
        ErrorCode.BAD_REQUEST
      );
    }

    const collections = await getCollectionsByTypeService(
      type as "new" | "trending" | "sale" | "featured"
    );

    returnSuccess(
      res,
      collections,
      "Collections retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);
