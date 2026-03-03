import type { Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { UPLOAD_MESSAGES } from "./upload.constants";
import { uploadProductImages } from "./upload.service";

export const uploadImagesController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new AppError(
        UPLOAD_MESSAGES.NO_FILES,
        ErrorCode.BAD_REQUEST,
        StatusCode.BAD_REQUEST,
      );
    }

    const result = await uploadProductImages(files);

    returnSuccess(res, result, UPLOAD_MESSAGES.UPLOAD_SUCCESS, StatusCode.CREATED);
  },
);
