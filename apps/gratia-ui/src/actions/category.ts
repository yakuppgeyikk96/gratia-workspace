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

export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    const response = await getCategoryTree();
    if (!response.success || !response.data) {
      return [];
    }

    const slugs: string[] = [];
    const extractSlugs = (nodes: CategoryTreeNode[]) => {
      for (const node of nodes) {
        slugs.push(node.slug);
        if (node.children && node.children.length > 0) {
          extractSlugs(node.children);
        }
      }
    };

    extractSlugs(response.data);
    return slugs;
  } catch (error) {
    console.error("Failed to get category slugs:", error);
    return [];
  }
}
