import { eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type Collection,
  collections,
  CollectionType,
  type NewCollection,
} from "../../db/schema/collection.schema";

/**
 * Create collection in database
 */
export const createCollection = async (
  collectionData: NewCollection
): Promise<Collection | null> => {
  const [collection] = await db
    .insert(collections)
    .values({
      ...collectionData,
      slug: collectionData.slug.toLowerCase(),
    })
    .returning();

  return collection || null;
};

/**
 * Find collection by slug
 */
export const findCollectionBySlug = async (
  slug: string
): Promise<Collection | null> => {
  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug.toLowerCase()))
    .limit(1);

  return collection || null;
};

/**
 * Find collection by ID
 */
export const findCollectionById = async (
  id: number
): Promise<Collection | null> => {
  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);

  return collection || null;
};

/**
 * Find all collections, sorted by sortOrder and name
 */
export const findAllCollections = async (): Promise<Collection[]> => {
  return await db
    .select()
    .from(collections)
    .orderBy(collections.sortOrder, collections.name);
};

/**
 * Find collections by type
 */
export const findCollectionsByType = async (
  collectionType: CollectionType | string
): Promise<Collection[]> => {
  return await db
    .select()
    .from(collections)
    .where(eq(collections.collectionType, collectionType as CollectionType))
    .orderBy(collections.sortOrder, collections.name);
};

/**
 * Find active collections
 */
export const findActiveCollections = async (): Promise<Collection[]> => {
  return await db
    .select()
    .from(collections)
    .where(eq(collections.isActive, true))
    .orderBy(collections.sortOrder, collections.name);
};
