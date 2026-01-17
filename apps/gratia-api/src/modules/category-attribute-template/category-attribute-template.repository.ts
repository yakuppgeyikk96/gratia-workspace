import { eq, sql } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  categoryAttributeTemplates,
  type CategoryAttributeTemplate,
  type NewCategoryAttributeTemplate,
} from "../../db/schema/category-attribute-template.schema";

/**
 * Get attribute template for a category
 */
export const getCategoryAttributeTemplate = async (
  categoryId: number
): Promise<CategoryAttributeTemplate | null> => {
  const [template] = await db
    .select()
    .from(categoryAttributeTemplates)
    .where(eq(categoryAttributeTemplates.categoryId, categoryId))
    .limit(1);

  return template || null;
};

/**
 * Get attribute templates for multiple categories
 */
export const getCategoryAttributeTemplates = async (
  categoryIds: number[]
): Promise<Map<number, CategoryAttributeTemplate>> => {
  if (categoryIds.length === 0) {
    return new Map();
  }

  const templates = await db
    .select()
    .from(categoryAttributeTemplates)
    .where(
      sql`${categoryAttributeTemplates.categoryId} = ANY(${sql.raw(
        `ARRAY[${categoryIds.join(",")}]`
      )})`
    );

  const templateMap = new Map<number, CategoryAttributeTemplate>();
  templates.forEach((template) => {
    templateMap.set(template.categoryId, template);
  });

  return templateMap;
};

/**
 * Create or update category attribute template
 */
export const upsertCategoryAttributeTemplate = async (
  data: NewCategoryAttributeTemplate
): Promise<CategoryAttributeTemplate> => {
  const [template] = await db
    .insert(categoryAttributeTemplates)
    .values(data)
    .onConflictDoUpdate({
      target: categoryAttributeTemplates.categoryId,
      set: {
        attributeDefinitions: data.attributeDefinitions,
        updatedAt: new Date(),
      },
    })
    .returning();

  return template as unknown as CategoryAttributeTemplate;
};

/**
 * Delete category attribute template
 */
export const deleteCategoryAttributeTemplate = async (
  categoryId: number
): Promise<boolean> => {
  const result = await db
    .delete(categoryAttributeTemplates)
    .where(eq(categoryAttributeTemplates.categoryId, categoryId))
    .returning();

  return result.length > 0;
};
