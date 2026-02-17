import {
  setRedisValue,
  getRedisValue,
  deleteRedisKeysByPattern,
} from "./redis.service";

export const createCache = <T>(prefix: string, ttl: number) => ({
  get: (keySuffix: string): Promise<T | null> =>
    getRedisValue<T>(`${prefix}:${keySuffix}`),
  set: (keySuffix: string, data: T): Promise<void> =>
    setRedisValue(`${prefix}:${keySuffix}`, data, ttl),
  invalidate: (pattern: string = "*"): Promise<void> =>
    deleteRedisKeysByPattern(`${prefix}:${pattern}`),
});
