import {
  setRedisValue,
  getRedisValue,
  deleteRedisKeysByPattern,
} from "../../shared/services/redis.service";
import type { ProductListResponse, SearchSuggestionsResponse } from "./types";

const CACHE_TTL = 300; // 5 minutes
const SUGGESTION_CACHE_TTL = 60; // 1 minute

export const getCategoryListCacheKey = (
  categorySlug: string,
  page: number,
  limit: number,
): string => {
  return `products:category:${categorySlug}:p${page}:l${limit}`;
};

export const getCollectionListCacheKey = (
  collectionSlug: string,
  page: number,
  limit: number,
): string => {
  return `products:collection:${collectionSlug}:p${page}:l${limit}`;
};

export const getCachedCategoryProducts = async (
  categorySlug: string,
  page: number,
  limit: number,
): Promise<ProductListResponse | null> => {
  const key = getCategoryListCacheKey(categorySlug, page, limit);
  return getRedisValue<ProductListResponse>(key);
};

export const getCachedCollectionProducts = async (
  collectionSlug: string,
  page: number,
  limit: number,
): Promise<ProductListResponse | null> => {
  const key = getCollectionListCacheKey(collectionSlug, page, limit);
  return getRedisValue<ProductListResponse>(key);
};

export const cacheCategoryProducts = async (
  categorySlug: string,
  page: number,
  limit: number,
  data: ProductListResponse,
): Promise<void> => {
  const key = getCategoryListCacheKey(categorySlug, page, limit);
  await setRedisValue(key, data, CACHE_TTL);
};

export const cacheCollectionProducts = async (
  collectionSlug: string,
  page: number,
  limit: number,
  data: ProductListResponse,
): Promise<void> => {
  const key = getCollectionListCacheKey(collectionSlug, page, limit);
  await setRedisValue(key, data, CACHE_TTL);
};

export const getSearchCacheKey = (
  query: string,
  page: number,
  limit: number,
): string => {
  return `products:search:${query.toLowerCase().trim()}:p${page}:l${limit}`;
};

export const getSuggestionCacheKey = (query: string): string => {
  return `products:suggestions:${query.toLowerCase().trim()}`;
};

export const getCachedSearchProducts = async (
  query: string,
  page: number,
  limit: number,
): Promise<ProductListResponse | null> => {
  const key = getSearchCacheKey(query, page, limit);
  return getRedisValue<ProductListResponse>(key);
};

export const cacheSearchProducts = async (
  query: string,
  page: number,
  limit: number,
  data: ProductListResponse,
): Promise<void> => {
  const key = getSearchCacheKey(query, page, limit);
  await setRedisValue(key, data, CACHE_TTL);
};

export const getCachedSuggestions = async (
  query: string,
): Promise<SearchSuggestionsResponse | null> => {
  const key = getSuggestionCacheKey(query);
  return getRedisValue<SearchSuggestionsResponse>(key);
};

export const cacheSuggestions = async (
  query: string,
  data: SearchSuggestionsResponse,
): Promise<void> => {
  const key = getSuggestionCacheKey(query);
  await setRedisValue(key, data, SUGGESTION_CACHE_TTL);
};

export const invalidateCategoryCache = async (
  categorySlug: string,
): Promise<void> => {
  await deleteRedisKeysByPattern(`products:category:${categorySlug}:*`);
};

export const invalidateCollectionCache = async (
  collectionSlug: string,
): Promise<void> => {
  await deleteRedisKeysByPattern(`products:collection:${collectionSlug}:*`);
};

export const invalidateAllProductListCaches = async (): Promise<void> => {
  await Promise.all([
    deleteRedisKeysByPattern("products:category:*"),
    deleteRedisKeysByPattern("products:collection:*"),
    deleteRedisKeysByPattern("products:search:*"),
    deleteRedisKeysByPattern("products:suggestions:*"),
  ]);
};
