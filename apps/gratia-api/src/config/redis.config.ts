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

    const socketConfig = {
      host: redisHost,
      port: Number(redisPort),
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          console.error("Redis: max reconnect attempts reached, giving up");
          return new Error("Max reconnect attempts reached");
        }
        const delay = Math.min(retries * 200, 5000);
        console.log(`Redis: reconnecting in ${delay}ms (attempt ${retries})...`);
        return delay;
      },
    };

    if (isDevelopment) {
      // Local Docker Redis — no auth needed
      redisClient = createClient({ socket: socketConfig });
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
        socket: socketConfig,
      });
    }

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("reconnecting", () => {
      console.log("Redis: reconnecting...");
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
