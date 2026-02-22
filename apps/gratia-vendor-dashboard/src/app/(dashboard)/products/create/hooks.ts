import { useMutation, useQuery } from "@tanstack/react-query";
import { createProductAction } from "@/actions/product.actions";
import {
  getActiveBrands,
  getCategories,
  getCategoryAttributeTemplate,
} from "@/lib/services/product.service";
import type { ICreateProductRequest } from "@/types";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    select: (response) => (response.success ? response.data : []),
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getActiveBrands,
    select: (response) => (response.success ? response.data : []),
  });
};

export const useCategoryAttributeTemplate = (categoryId: number) => {
  return useQuery({
    queryKey: ["categoryAttributeTemplate", categoryId],
    queryFn: () => getCategoryAttributeTemplate(categoryId),
    enabled: categoryId > 0,
    select: (response) => (response.success ? response.data : null),
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (data: ICreateProductRequest) => createProductAction(data),
  });
};
