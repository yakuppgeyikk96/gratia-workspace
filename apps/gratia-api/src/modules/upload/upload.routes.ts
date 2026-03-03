import { Router, type IRouter } from "express";
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { StatusCode } from "../../shared/types";
import {
  MAX_FILE_SIZE,
  MAX_FILES,
  ALLOWED_MIME_TYPES,
  UPLOAD_MESSAGES,
} from "./upload.constants";
import { uploadImagesController } from "./upload.controller";

const router: IRouter = Router();

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        UPLOAD_MESSAGES.INVALID_FILE_TYPE,
        ErrorCode.BAD_REQUEST,
        StatusCode.BAD_REQUEST,
      ),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

// POST /api/uploads/images
router.post(
  "/images",
  authMiddleware,
  upload.array("images", MAX_FILES),
  uploadImagesController,
);

export default router;
