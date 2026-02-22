export const API_BASE_PATH =
  typeof window !== "undefined"
    ? "/vendor/api"
    : `${process.env.API_URL || "http://localhost:8080"}/api`;
