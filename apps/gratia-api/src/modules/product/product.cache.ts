import {
  setRedisValue,
  getRedisValue,
  deleteRedisKeysByPattern,
} from "../../shared/services/redis.service";
import type { ProductListResponse } from "./types";

const CACHE_TTL = 300; // 5 dakika

// ============================================================================
// Cache Key Generators
// ============================================================================

export const getCategoryListCacheKey = (
  categorySlug: string,
  page: number,
  limit: number
): string => {
  return `products:category:${categorySlug}:p${page}:l${limit}`;
};

export const getCollectionListCacheKey = (
  collectionSlug: string,
  page: number,
  limit: number
): string => {
  return `products:collection:${collectionSlug}:p${page}:l${limit}`;
};

// ============================================================================
// Cache Get Operations
// ============================================================================

export const getCachedCategoryProducts = async (
  categorySlug: string,
  page: number,
  limit: number
): Promise<ProductListResponse | null> => {
  const key = getCategoryListCacheKey(categorySlug, page, limit);
  return getRedisValue<ProductListResponse>(key);
};

export const getCachedCollectionProducts = async (
  collectionSlug: string,
  page: number,
  limit: number
): Promise<ProductListResponse | null> => {
  const key = getCollectionListCacheKey(collectionSlug, page, limit);
  return getRedisValue<ProductListResponse>(key);
};

// ============================================================================
// Cache Set Operations
// ============================================================================

export const cacheCategoryProducts = async (
  categorySlug: string,
  page: number,
  limit: number,
  data: ProductListResponse
): Promise<void> => {
  const key = getCategoryListCacheKey(categorySlug, page, limit);
  await setRedisValue(key, data, CACHE_TTL);
};

export const cacheCollectionProducts = async (
  collectionSlug: string,
  page: number,
  limit: number,
  data: ProductListResponse
): Promise<void> => {
  const key = getCollectionListCacheKey(collectionSlug, page, limit);
  await setRedisValue(key, data, CACHE_TTL);
};

// ============================================================================
// Cache Invalidation Operations
// ============================================================================

export const invalidateCategoryCache = async (
  categorySlug: string
): Promise<void> => {
  await deleteRedisKeysByPattern(`products:category:${categorySlug}:*`);
};

export const invalidateCollectionCache = async (
  collectionSlug: string
): Promise<void> => {
  await deleteRedisKeysByPattern(`products:collection:${collectionSlug}:*`);
};

export const invalidateAllProductListCaches = async (): Promise<void> => {
  await Promise.all([
    deleteRedisKeysByPattern("products:category:*"),
    deleteRedisKeysByPattern("products:collection:*"),
  ]);
};
