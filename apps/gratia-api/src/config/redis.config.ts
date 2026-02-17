import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<void> => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const redisHost = isDevelopment
    ? (process.env.REDIS_HOST_LOCAL as string)
    : (process.env.REDIS_HOST as string);
  const redisPort = isDevelopment
    ? (process.env.REDIS_PORT_LOCAL as string)
    : (process.env.REDIS_PORT as string);

  console.log("Connecting to Redis...");

  try {
    if (!redisHost || !redisPort) {
      throw new Error("Redis host/port configuration is missing");
    }

    if (isDevelopment) {
      // Local Docker Redis — no auth needed
      redisClient = createClient({
        socket: {
          host: redisHost,
          port: Number(redisPort),
        },
      });
    } else {
      // Production — requires auth
      const redisUsername = process.env.REDIS_USERNAME as string;
      const redisPassword = process.env.REDIS_PASSWORD as string;

      if (!redisUsername || !redisPassword) {
        throw new Error("Redis credentials are missing for production");
      }

      redisClient = createClient({
        username: redisUsername,
        password: redisPassword,
        socket: {
          host: redisHost,
          port: Number(redisPort),
        },
      });
    }

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("--------------------------------");
      console.log("✅ Redis connected successfully");
      console.log(`- Environment: ${isDevelopment ? "LOCAL" : "PRODUCTION"}`);
      console.log(`- Host: ${redisHost}`);
      console.log(`- Port: ${redisPort}`);
      console.log("--------------------------------");
    });

    await redisClient.connect();
  } catch (error) {
    console.error("Redis connection error:", error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    console.log("Redis disconnected");
  }
};
