import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type Category,
  categories,
  NewCategory,
} from "../../db/schema/category.schema";

export const findCategoryById = async (
  id: number
): Promise<Category | null> => {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return category || null;
};

export const findCategoryBySlug = async (
  slug: string
): Promise<Category | null> => {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug.toLowerCase()))
    .limit(1);

  return category || null;
};

export const findAllCategories = async (): Promise<Category[]> => {
  return await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
};

export const findActiveCategories = async (): Promise<Category[]> => {
  return await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
};

export const findActiveRootCategories = async (): Promise<Category[]> => {
  return await db
    .select()
    .from(categories)
    .where(and(eq(categories.isActive, true), eq(categories.level, 0)))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
};

export const findCategoriesByParentId = async (
  parentId: number | null
): Promise<Category[]> => {
  if (parentId === null) {
    // Find root categories (no parent)
    return await db
      .select()
      .from(categories)
      .where(isNull(categories.parentId))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  return await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, parentId))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
};

export const createCategory = async (
  categoryData: Omit<NewCategory, "id" | "createdAt" | "updatedAt">
): Promise<Category | null> => {
  // Calculate level if not provided
  let level = categoryData.level ?? 0;
  if (categoryData.parentId) {
    const parent = await findCategoryById(categoryData.parentId);
    if (parent) {
      level = parent.level + 1;
    }
  }

  const [category] = await db
    .insert(categories)
    .values({
      ...categoryData,
      level,
      slug: categoryData.slug.toLowerCase(),
    })
    .returning();

  return category || null;
};
