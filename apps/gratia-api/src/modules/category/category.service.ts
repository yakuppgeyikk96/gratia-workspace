import { Category } from "../../db/schema/category.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import {
  activeKey,
  allKey,
  bySlugKey,
  byIdKey,
  categoryItemCache,
  categoryListCache,
  categoryTreeCache,
  invalidateAllCategoryCaches,
  rootKey,
  subKey,
  treeKey,
} from "./category.cache";
import { CATEGORY_MESSAGES } from "./category.constants";
import {
  createCategory,
  findActiveCategories,
  findActiveRootCategories,
  findAllCategories,
  findCategoriesByParentId,
  findCategoryById,
  findCategoryBySlug,
} from "./category.repository";
import { CategoryTreeNode } from "./category.types";
import type { CreateCategoryDto } from "./category.validations";

const writeListCache = (key: string, value: Category[]): void => {
  categoryListCache.set(key, value).catch((err) =>
    console.error("Category list cache write failed:", err),
  );
};

const writeItemCache = (key: string, value: Category): void => {
  categoryItemCache.set(key, value).catch((err) =>
    console.error("Category item cache write failed:", err),
  );
};

export const createCategoryService = async (
  data: CreateCategoryDto
): Promise<Category> => {
  const existingCategory = await findCategoryBySlug(data.slug);

  if (existingCategory) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  // Validate parent category if provided
  let parentIdNumber: number | null = null;
  if (data.parentId) {
    const parentCategory = await findCategoryById(data.parentId);
    if (!parentCategory) {
      throw new AppError(
        CATEGORY_MESSAGES.PARENT_CATEGORY_NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }
    parentIdNumber = data.parentId;
  }

  const category = await createCategory({
    name: data.name,
    slug: data.slug,
    description: data.description,
    parentId: parentIdNumber,
    level: data.level,
    imageUrl: data.imageUrl,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
  });

  if (!category) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  invalidateAllCategoryCaches().catch((err) =>
    console.error("Category cache invalidation failed:", err),
  );

  return category;
};

export const getAllCategoriesService = async (): Promise<Category[]> => {
  const cached = await categoryListCache.get(allKey());
  if (cached) return cached;

  const result = await findAllCategories();
  writeListCache(allKey(), result);
  return result;
};

export const getActiveCategoriesService = async (): Promise<Category[]> => {
  const cached = await categoryListCache.get(activeKey());
  if (cached) return cached;

  const result = await findActiveCategories();
  writeListCache(activeKey(), result);
  return result;
};

export const getActiveRootCategoriesService = async (): Promise<Category[]> => {
  const cached = await categoryListCache.get(rootKey());
  if (cached) return cached;

  const result = await findActiveRootCategories();
  writeListCache(rootKey(), result);
  return result;
};

export const getCategoryByIdService = async (id: number): Promise<Category> => {
  const cacheKey = byIdKey(id);
  const cached = await categoryItemCache.get(cacheKey);
  if (cached) return cached;

  const category = await findCategoryById(id);

  if (!category) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  writeItemCache(cacheKey, category);
  return category;
};

export const getCategoryBySlugService = async (
  slug: string
): Promise<Category> => {
  const cacheKey = bySlugKey(slug);
  const cached = await categoryItemCache.get(cacheKey);
  if (cached) return cached;

  const category = await findCategoryBySlug(slug);

  if (!category) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  writeItemCache(cacheKey, category);
  return category;
};

export const getSubCategoriesService = async (
  parentId: number | null
): Promise<Category[]> => {
  const cacheKey = subKey(parentId);
  const cached = await categoryListCache.get(cacheKey);
  if (cached) return cached;

  const result = await findCategoriesByParentId(parentId);
  writeListCache(cacheKey, result);
  return result;
};

export const getCategoryTreeService = async (): Promise<CategoryTreeNode[]> => {
  const cached = await categoryTreeCache.get(treeKey());
  if (cached) return cached;

  const allCategories = await findAllCategories();

  const buildTree = (parentId: number | null = null): CategoryTreeNode[] => {
    return allCategories
      .filter((cat) => {
        if (parentId === null) {
          return cat.parentId === null || cat.parentId === undefined;
        }
        return cat.parentId === parentId;
      })
      .map((cat) => ({
        ...cat,
        children: buildTree(cat.id),
      }));
  };

  const tree = buildTree();
  categoryTreeCache.set(treeKey(), tree).catch((err) =>
    console.error("Category tree cache write failed:", err),
  );

  return tree;
};
