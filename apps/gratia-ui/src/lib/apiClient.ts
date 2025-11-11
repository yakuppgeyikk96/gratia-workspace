import { logoutUser } from "@/actions";
import { API_BASE_PATH } from "@/constants";
import { IApiRequestOptions, IApiResponse } from "@/types";

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string = API_BASE_PATH, defaultTimeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: IApiRequestOptions = {}
  ): Promise<IApiResponse<T>> {
    const { method = "GET", body, timeout = this.defaultTimeout } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Non-JSON response received:", textResponse);

        return {
          success: false,
          message: `Server returned non-JSON response (${response.status})`,
          errorCode: "INVALID_RESPONSE",
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();

      if (data.errorCode === "UNAUTHORIZED") {
        logoutUser();
        window.location.reload();
      }

      if (!response.ok) {
        return {
          success: false,
          message:
            data.message || `HTTP ${response.status}: ${response.statusText}`,
          errors: data.errors || [],
          errorCode: data.errorCode || "HTTP_ERROR",
          timestamp: data.timestamp || new Date().toISOString(),
        };
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data.data,
        errors: data.errors || [],
        errorCode: data.errorCode,
        timestamp: data.timestamp,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            message: "Request timeout",
            errorCode: "TIMEOUT",
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: false,
          message: error.message || "Network error",
          errorCode: "NETWORK_ERROR",
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        message: "Unknown error occurred",
        errorCode: "UNKNOWN_ERROR",
        timestamp: new Date().toISOString(),
      };
    }
  }

  async get<T>(
    endpoint: string,
    options?: Omit<IApiRequestOptions, "method" | "body">
  ) {
    return this.makeRequest<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<IApiRequestOptions, "method">
  ) {
    return this.makeRequest<T>(endpoint, { ...options, method: "POST", body });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<IApiRequestOptions, "method">
  ) {
    return this.makeRequest<T>(endpoint, { ...options, method: "PUT", body });
  }

  async delete<T>(
    endpoint: string,
    options?: Omit<IApiRequestOptions, "method" | "body">
  ) {
    return this.makeRequest<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<IApiRequestOptions, "method">
  ) {
    return this.makeRequest<T>(endpoint, { ...options, method: "PATCH", body });
  }
}

export const apiClient = new ApiClient();
