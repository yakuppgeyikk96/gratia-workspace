"use server";

import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import { CategoryTreeNode } from "@/types/Category.types";

const API_BASE_ROUTE = "/categories";

export async function getCategoryTree(): Promise<
  IApiResponse<CategoryTreeNode[]>
> {
  return await apiClient.get(`${API_BASE_ROUTE}/tree`);
}
