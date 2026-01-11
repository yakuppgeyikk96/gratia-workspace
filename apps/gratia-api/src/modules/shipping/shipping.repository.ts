import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type ShippingMethod,
  shippingMethods,
} from "../../db/schema/shipping.schema";

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
 */
export const findAvailableShippingMethodsByCountry = async (
  country: string
): Promise<ShippingMethod[]> => {
  return await db
    .select()
    .from(shippingMethods)
    .where(
      and(
        eq(shippingMethods.isActive, true),
        or(
          // Available in all countries (empty array)
          sql`${shippingMethods.availableCountries} = '[]'::jsonb`,
          // Available in specific country - check if array contains the country using @> operator
          sql`${shippingMethods.availableCountries} @> ${sql.raw(`'"${country}"'`)}::jsonb`
        )
      )
    )
    .orderBy(shippingMethods.sortOrder, shippingMethods.createdAt);
};

/**
 * Finds shipping method by ID and validates it's active
 */
export const findShippingMethodByIdAndValidate = async (
  id: number
): Promise<ShippingMethod | null> => {
  const [method] = await db
    .select()
    .from(shippingMethods)
    .where(
      and(eq(shippingMethods.id, id), eq(shippingMethods.isActive, true))
    )
    .limit(1);

  return method || null;
};
