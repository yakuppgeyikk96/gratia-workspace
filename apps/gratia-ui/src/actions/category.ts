"use server";

import { apiClient } from "@/lib/apiClient";
import { IApiResponse } from "@/types/Api.types";
import { CategoryTreeNode } from "@/types/Category.types";
import { unstable_cache } from "next/cache";

const API_BASE_ROUTE = "/categories";

export async function getCategoryTree(): Promise<
  IApiResponse<CategoryTreeNode[]>
> {
  const cached = unstable_cache(
    () => apiClient.get<CategoryTreeNode[]>(`${API_BASE_ROUTE}/tree`),
    ["categories:tree"],
    { revalidate: 60, tags: ["categories"] },
  );
  return await cached();
}
