import crypto from "node:crypto";
import path from "node:path";
import { getStorageProvider } from "../../shared/services/storage";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { StatusCode } from "../../shared/types";
import { UPLOAD_MESSAGES } from "./upload.constants";
import type { UploadImagesResponse } from "./types";

export const uploadProductImages = async (
  files: Express.Multer.File[],
): Promise<UploadImagesResponse> => {
  const storage = getStorageProvider();

  const uploadPromises = files.map(async (file) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const storagePath = `products/images/${crypto.randomUUID()}${ext}`;

    const result = await storage.upload(storagePath, file.buffer, {
      contentType: file.mimetype,
    });

    return result.publicUrl;
  });

  try {
    const urls = await Promise.all(uploadPromises);
    return { urls };
  } catch {
    throw new AppError(
      UPLOAD_MESSAGES.UPLOAD_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR,
      StatusCode.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Delete uploaded images by their public URLs (best-effort).
 * Extracts the storage path from the URL and deletes each file.
 * Failures are logged but never thrown — this is a cleanup utility.
 */
export const deleteUploadedImages = async (urls: string[]): Promise<void> => {
  const storage = getStorageProvider();

  const deletePromises = urls.map(async (url) => {
    try {
      // Extract storage path from public URL
      // URL format: https://storage.googleapis.com/<bucket>/<path>
      const urlObj = new URL(url);
      // pathname: /<bucket>/products/images/<uuid>.<ext>
      // Remove leading slash and bucket name to get storage path
      const pathParts = urlObj.pathname.split("/").slice(2);
      const storagePath = pathParts.join("/");

      await storage.delete(storagePath);
    } catch (err) {
      console.error(`Failed to delete uploaded image ${url}:`, err);
    }
  });

  await Promise.all(deletePromises);
};
