import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Production is opt-in: only NODE_ENV=production targets the production
// database. An unset or unexpected NODE_ENV resolves to local, so a forgotten
// variable can never cause `drizzle-kit push` to rewrite the production schema.
const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = isProduction
  ? process.env.DATABASE_URL_PRODUCTION
  : process.env.DATABASE_URL_LOCAL;

if (!databaseUrl) {
  throw new Error(
    `DATABASE_URL_${isProduction ? "PRODUCTION" : "LOCAL"} is not set`
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
