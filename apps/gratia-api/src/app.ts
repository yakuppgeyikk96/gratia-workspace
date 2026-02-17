import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import {
  connectRedis,
  disconnectRedis,
  routesConfig,
  validateEnvironment,
} from "./config";
import {
  disconnectPostgres,
  testPostgresConnection,
} from "./config/postgres.config";
import { startOrderCleanupJob } from "./modules/order/order-cleanup.service";
import stripeWebhookRoutes from "./modules/webhooks/stripe.routes";
import { requestLogger } from "./shared/middlewares/request-logger.middleware";
import {
  getRedisKeyTTL,
  getRedisValue,
  initializeEmailService,
  setRedisValue,
} from "./shared/services";

validateEnvironment();

const isDevelopment = process.env.NODE_ENV === "development";

const app = express();

// Connect to services (non-blocking, don't crash if they fail)
connectRedis().catch((err) => {
  console.error("Redis connection failed:", err);
});
testPostgresConnection().catch((err) => {
  console.error("PostgreSQL connection failed:", err);
});
initializeEmailService();

// Middleware
app.use(helmet());
app.use(cors());

app.use(requestLogger);

// Compression middleware - reduces response size by ~70-90%
app.use(
  compression({
    level: 6, // Compression level (0-9, 6 is default)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Don't compress if the request explicitly disables it
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Use default compression filter
      return compression.filter(req, res);
    },
  })
);

// Stripe webhooks must be mounted BEFORE express.json()
app.use("/api/webhooks", stripeWebhookRoutes);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.send({ status: "ok" });
});

// Debug endpoints — development only
if (isDevelopment) {
  app.get("/api/test-redis", async (_req, res) => {
    try {
      await setRedisValue(
        "checkout:test:session-123",
        {
          userId: "user-123",
          cartTotal: 1299.99,
          createdAt: new Date().toISOString(),
        },
        20
      );

      const session = await getRedisValue("checkout:test:session-123");

      const ttl = await getRedisKeyTTL("checkout:test:session-123");

      res.json({
        success: true,
        session,
        ttlSeconds: ttl,
      });
    } catch (error) {
      res.json({ success: false, error: (error as Error).message });
    }
  });

  app.get("/api/test-postgres", async (_req, res) => {
    try {
      await testPostgresConnection();
      res.json({ success: true, message: "PostgreSQL connection successful" });
    } catch (error) {
      res.json({ success: false, error: (error as Error).message });
    }
  });
}

routesConfig(app);

// Start scheduled jobs
startOrderCleanupJob();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(Number(PORT), HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown — Cloud Run sends SIGTERM before stopping the container
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);

  // Stop accepting new connections, wait for in-flight requests to finish
  server.close(async () => {
    console.log("HTTP server closed");

    await Promise.allSettled([disconnectRedis(), disconnectPostgres()]);

    console.log("All connections closed, exiting");
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long (Cloud Run gives 10s by default)
  setTimeout(() => {
    console.error("Graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, 8000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
