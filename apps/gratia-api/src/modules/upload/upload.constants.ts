export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES = 10;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const UPLOAD_MESSAGES = {
  NO_FILES: "No files were uploaded",
  INVALID_FILE_TYPE: "Invalid file type. Allowed types: JPEG, PNG, WebP, AVIF",
  FILE_TOO_LARGE: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
  TOO_MANY_FILES: `Maximum ${MAX_FILES} files allowed per upload`,
  UPLOAD_SUCCESS: "Images uploaded successfully",
  UPLOAD_FAILED: "Failed to upload images",
} as const;
