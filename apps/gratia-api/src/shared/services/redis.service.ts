import { getRedisClient } from "../../config/redis.config";

/**
 * Set a key-value pair in Redis with optional TTL (in seconds)
 */
export const setRedisValue = async (
  key: string,
  value: any,
  ttl?: number
): Promise<void> => {
  const client = getRedisClient();
  const serializedValue = JSON.stringify(value);

  if (ttl) {
    await client.setEx(key, ttl, serializedValue);
  } else {
    await client.set(key, serializedValue);
  }
};

/**
 * Get a value from Redis by key
 */
export const getRedisValue = async <T = any>(
  key: string
): Promise<T | null> => {
  const client = getRedisClient();
  const value = await client.get(key);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as T;
};

/**
 * Delete a key from Redis
 */
export const deleteRedisValue = async (key: string): Promise<void> => {
  const client = getRedisClient();
  await client.del(key);
};

/**
 * Check if a key exists in Redis
 */
export const existsRedisKey = async (key: string): Promise<boolean> => {
  const client = getRedisClient();
  const exists = await client.exists(key);
  return exists === 1;
};

/**
 * Get TTL (time to live) for a key in seconds
 */
export const getRedisKeyTTL = async (key: string): Promise<number> => {
  const client = getRedisClient();
  return await client.ttl(key);
};

/**
 * Set expiration time for a key (in seconds)
 */
export const setRedisKeyExpire = async (
  key: string,
  seconds: number
): Promise<void> => {
  const client = getRedisClient();
  await client.expire(key, seconds);
};

/**
 * Get all keys matching a pattern (uses SCAN instead of KEYS to avoid blocking Redis)
 */
export const getRedisKeys = async (pattern: string): Promise<string[]> => {
  const client = getRedisClient();
  const keys: string[] = [];
  for await (const batch of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    if (Array.isArray(batch)) {
      keys.push(...batch);
    } else {
      keys.push(batch);
    }
  }
  return keys;
};

/**
 * Delete all keys matching a pattern (uses SCAN instead of KEYS)
 */
export const deleteRedisKeysByPattern = async (
  pattern: string
): Promise<void> => {
  const client = getRedisClient();
  const keys: string[] = [];
  for await (const batch of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    if (Array.isArray(batch)) {
      keys.push(...batch);
    } else {
      keys.push(batch);
    }
  }

  if (keys.length > 0) {
    await client.del(keys);
  }
};

/**
 * Set a key-value pair only if it does not already exist (atomic)
 * Returns true if the key was set, false if it already existed
 */
export const setRedisValueNX = async (
  key: string,
  value: any,
  ttl: number
): Promise<boolean> => {
  const client = getRedisClient();
  const result = await client.set(key, JSON.stringify(value), {
    NX: true,
    EX: ttl,
  });
  return result === "OK";
};
