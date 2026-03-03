import { useMutation, useQuery } from "@tanstack/react-query";
import { createProductAction } from "@/actions/product.actions";
import { getAuthToken } from "@/actions/utils";
import {
  getActiveBrands,
  getCategories,
  getCategoryAttributeTemplate,
} from "@/lib/services/product.service";
import type { ICreateProductRequest, IUploadImagesResponse } from "@/types";

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

export const useUploadImages = () => {
  return useMutation({
    mutationFn: async (files: File[]): Promise<string[]> => {
      const token = await getAuthToken();

      const formData = new FormData();
      for (const file of files) {
        formData.append("images", file);
      }

      const res = await fetch("/vendor/api/uploads/images", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(
          (error as { message?: string } | null)?.message ?? "Failed to upload images",
        );
      }

      const json = (await res.json()) as { data: IUploadImagesResponse };
      return json.data.urls;
    },
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (data: ICreateProductRequest) => createProductAction(data),
  });
};
