import { Category } from "../../db/schema/category.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
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

  return category;
};

export const getAllCategoriesService = async (): Promise<Category[]> => {
  return await findAllCategories();
};

export const getActiveCategoriesService = async (): Promise<Category[]> => {
  return await findActiveCategories();
};

export const getActiveRootCategoriesService = async (): Promise<Category[]> => {
  return await findActiveRootCategories();
};

export const getCategoryByIdService = async (id: number): Promise<Category> => {
  const category = await findCategoryById(id);

  if (!category) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return category;
};

export const getCategoryBySlugService = async (
  slug: string
): Promise<Category> => {
  const category = await findCategoryBySlug(slug);

  if (!category) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }
  return category;
};

export const getSubCategoriesService = async (
  parentId: number | null
): Promise<Category[]> => {
  return await findCategoriesByParentId(parentId);
};

export const getCategoryTreeService = async (): Promise<CategoryTreeNode[]> => {
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

  return buildTree();
};
