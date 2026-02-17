import {
  setRedisValue,
  getRedisValue,
  deleteRedisKeysByPattern,
} from "../../shared/services/redis.service";
import type {
  ProductDetailResponse,
  ProductListItem,
  ProductListResponse,
  SearchSuggestionsResponse,
} from "./types";

// TTL constants
const LIST_CACHE_TTL = 300; // 5 minutes
const DETAIL_CACHE_TTL = 600; // 10 minutes
const SUGGESTION_CACHE_TTL = 60; // 1 minute

// --- Factory ---

const createCache = <T>(prefix: string, ttl: number) => ({
  get: (keySuffix: string): Promise<T | null> =>
    getRedisValue<T>(`${prefix}:${keySuffix}`),
  set: (keySuffix: string, data: T): Promise<void> =>
    setRedisValue(`${prefix}:${keySuffix}`, data, ttl),
  invalidate: (pattern: string = "*"): Promise<void> =>
    deleteRedisKeysByPattern(`${prefix}:${pattern}`),
});

// --- Cache instances ---

export const productListCache =
  createCache<ProductListResponse>("products:list", LIST_CACHE_TTL);

export const categoryCache =
  createCache<ProductListResponse>("products:category", LIST_CACHE_TTL);

export const collectionCache =
  createCache<ProductListResponse>("products:collection", LIST_CACHE_TTL);

export const searchCache =
  createCache<ProductListResponse>("products:search", LIST_CACHE_TTL);

export const suggestionsCache =
  createCache<SearchSuggestionsResponse>(
    "products:suggestions",
    SUGGESTION_CACHE_TTL,
  );

export const productDetailCache =
  createCache<ProductDetailResponse>("products:detail", DETAIL_CACHE_TTL);

export const featuredCache =
  createCache<ProductListItem[]>("products:featured", DETAIL_CACHE_TTL);

// --- Key builders ---

export const paginationKey = (page: number, limit: number) =>
  `p${page}:l${limit}`;

export const categoryKey = (slug: string, page: number, limit: number) =>
  `${slug}:p${page}:l${limit}`;

export const collectionKey = (slug: string, page: number, limit: number) =>
  `${slug}:p${page}:l${limit}`;

export const searchKey = (query: string, page: number, limit: number) =>
  `${query.toLowerCase().trim()}:p${page}:l${limit}`;

export const suggestionKey = (query: string) => query.toLowerCase().trim();

// --- Bulk invalidation ---

export const invalidateAllProductCaches = async (): Promise<void> => {
  await Promise.all([
    productListCache.invalidate(),
    categoryCache.invalidate(),
    collectionCache.invalidate(),
    searchCache.invalidate(),
    suggestionsCache.invalidate(),
    productDetailCache.invalidate(),
    featuredCache.invalidate(),
  ]);
};
