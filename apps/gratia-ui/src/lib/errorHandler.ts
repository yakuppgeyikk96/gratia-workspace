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

export function handleFormError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
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

export function getToastError(error: unknown): {
  title: string;
  description: string;
} {
  if (error instanceof AppError) {
    switch (error.code) {
      case "VALIDATION_ERROR":
        return {
          title: "Validation Error",
          description: error.message,
        };
      case "NETWORK_ERROR":
        return {
          title: "Connection Error",
          description: "Please check your internet connection and try again.",
        };
      case "TIMEOUT":
        return {
          title: "Request Timeout",
          description: "The request took too long. Please try again.",
        };
      default:
        return {
          title: "Error",
          description: error.message,
        };
    }
  }

  if (error instanceof Error) {
    return {
      title: "Error",
      description: error.message,
    };
  }

  return {
    title: "Unknown Error",
    description: "An unexpected error occurred. Please try again.",
  };
}
