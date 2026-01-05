import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Use local database for migrations in development
const isDevelopment = process.env.NODE_ENV === "development";
const databaseUrl = isDevelopment
  ? process.env.DATABASE_URL_LOCAL
  : process.env.DATABASE_URL_PRODUCTION;

if (!databaseUrl) {
  throw new Error(
    `DATABASE_URL_${isDevelopment ? "LOCAL" : "PRODUCTION"} is not set`
  );
}

export default {
  schema: "./src/db/schema/*.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
