import dotenv from "dotenv";

dotenv.config();

export const validateEnvironment = (): void => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const required = [
    "JWT_SECRET",
    ...(isDevelopment
      ? ["REDIS_HOST_LOCAL", "REDIS_PORT_LOCAL"]
      : ["REDIS_HOST", "REDIS_PORT", "REDIS_USERNAME", "REDIS_PASSWORD"]),
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  // Optional validations
  if (
    process.env.JWT_EXPIRES_IN &&
    !/^\d+[dhms]$/.test(process.env.JWT_EXPIRES_IN)
  ) {
    throw new Error('JWT_EXPIRES_IN must be in format like "30d", "7h", "60m"');
  }

  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    throw new Error("PORT must be a valid number");
  }
};
