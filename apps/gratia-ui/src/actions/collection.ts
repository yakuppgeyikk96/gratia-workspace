"use server";

import { getNavigationItems } from "./navigation";

export async function getAllCollectionSlugs(): Promise<string[]> {
  try {
    const response = await getNavigationItems();
    if (!response.success || !response.data) {
      return [];
    }

    return response.data.collections.map((collection) => collection.slug);
  } catch (error) {
    console.error("Failed to get collection slugs:", error);
    return [];
  }
}