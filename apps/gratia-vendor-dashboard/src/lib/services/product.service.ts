import { apiClient } from "@/lib/apiClient";
import type {
  IBrand,
  ICategory,
  ICategoryAttributeTemplate,
  IApiResponse,
} from "@/types";

export const getCategories = async (): Promise<IApiResponse<ICategory[]>> => {
  return apiClient.get<ICategory[]>("/categories/active");
};

export const getActiveBrands = async (): Promise<IApiResponse<IBrand[]>> => {
  return apiClient.get<IBrand[]>("/brands/active");
};

export const getCategoryAttributeTemplate = async (
  categoryId: number,
): Promise<IApiResponse<ICategoryAttributeTemplate | null>> => {
  return apiClient.get<ICategoryAttributeTemplate | null>(
    `/category-attribute-templates/${categoryId}`,
  );
};
