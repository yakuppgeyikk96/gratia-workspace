import { eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type ShippingMethod,
  shippingMethods,
} from "../../db/schema/shipping.schema";

/**
 * In-memory cache for shipping methods
 * Cache TTL: 5 minutes (shipping methods rarely change)
 */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let shippingMethodsCache: {
  data: ShippingMethod[];
  timestamp: number;
} | null = null;

/**
 * Check if cache is still valid
 */
const isCacheValid = (): boolean => {
  if (!shippingMethodsCache) return false;
  const now = Date.now();
  return now - shippingMethodsCache.timestamp < CACHE_TTL_MS;
};

/**
 * Get all active shipping methods from cache or database
 * @internal - Use this for cache-enabled queries
 */
const getAllActiveShippingMethodsCached = async (): Promise<
  ShippingMethod[]
> => {
  // Return cached data if valid
  if (isCacheValid()) {
    return shippingMethodsCache!.data;
  }

  // Fetch from database
  const methods = await db
    .select()
    .from(shippingMethods)
    .where(eq(shippingMethods.isActive, true))
    .orderBy(shippingMethods.sortOrder, shippingMethods.createdAt);

  // Update cache
  shippingMethodsCache = {
    data: methods,
    timestamp: Date.now(),
  };

  return methods;
};

/**
 * Finds all active shipping methods, sorted by sortOrder
 */
export const findAllActiveShippingMethods = async (): Promise<
  ShippingMethod[]
> => {
  return await db
    .select()
    .from(shippingMethods)
    .where(eq(shippingMethods.isActive, true))
    .orderBy(shippingMethods.sortOrder, shippingMethods.createdAt);
};

/**
 * Finds shipping method by ID
 */
export const findShippingMethodById = async (
  id: number
): Promise<ShippingMethod | null> => {
  const [method] = await db
    .select()
    .from(shippingMethods)
    .where(eq(shippingMethods.id, id))
    .limit(1);

  return method || null;
};

/**
 * Finds available shipping methods for a specific country
 * Available if availableCountries is empty (all countries) or contains the country
 * Uses in-memory cache to avoid repeated database queries
 */
export const findAvailableShippingMethodsByCountry = async (
  country: string
): Promise<ShippingMethod[]> => {
  // Get all active methods from cache
  const allMethods = await getAllActiveShippingMethodsCached();

  // Filter in-memory by country availability
  return allMethods.filter((method) => {
    const availableCountries = method.availableCountries as string[] | null;

    // Available in all countries (empty or null array)
    if (!availableCountries || availableCountries.length === 0) {
      return true;
    }

    // Available in specific country
    return availableCountries.includes(country);
  });
};

/**
 * Finds shipping method by ID and validates it's active
 * Uses in-memory cache to avoid database query
 */
export const findShippingMethodByIdAndValidate = async (
  id: number
): Promise<ShippingMethod | null> => {
  // Get all active methods from cache
  const allMethods = await getAllActiveShippingMethodsCached();

  // Find method by ID (already filtered for active methods)
  return allMethods.find((method) => method.id === id) || null;
};
