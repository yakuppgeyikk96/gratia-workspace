import { IApiResponse } from "@/types/Api.types";

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(response: IApiResponse): never {
  throw new AppError(
    response.message || "An error occurred",
    response.errorCode,
    response.errors?.[0] ? 400 : 500
  );
}

export function logError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = error instanceof AppError ? error.code : "UNKNOWN";
  console.error(`[${context || "App"}] Error:`, {
    message: errorMessage,
    code: errorCode,
    timestamp: new Date().toISOString(),
  });
}

