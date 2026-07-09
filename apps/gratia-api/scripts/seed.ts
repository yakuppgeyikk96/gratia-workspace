// CLI seed runner. Bypasses the HTTP /api/seed route (which requires auth)
// and calls seedDatabase() directly against the DATABASE_URL_LOCAL Postgres.
//
// Usage: pnpm db:seed
//
// postgres.config only selects the production database when NODE_ENV=production,
// so this seeds the local Postgres unless you explicitly opt in to production.
// Redis is contacted for cache invalidation at the end; failure there is
// non-fatal (data is already in Postgres).

import "dotenv/config";
import { connectRedis, disconnectRedis } from "../src/config/redis.config";
import { disconnectPostgres } from "../src/config/postgres.config";
import { seedDatabase } from "../src/modules/seed/seed.service";

const main = async (): Promise<void> => {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv === "production" && process.env.ALLOW_SEED !== "true") {
    console.error("Refusing to seed with NODE_ENV=production (set ALLOW_SEED=true to override)");
    process.exit(1);
  }

  console.log(`Seeding [${nodeEnv}]…`);

  try {
    await connectRedis();
  } catch (err) {
    console.warn("Redis not reachable — seed will still populate Postgres but cache invalidation calls will fail:", (err as Error).message);
  }

  try {
    const result = await seedDatabase();
    console.log("\n✅ Seed complete");
    console.log(JSON.stringify(result.stats, null, 2));
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await Promise.allSettled([disconnectRedis(), disconnectPostgres()]);
  }
};

main();
