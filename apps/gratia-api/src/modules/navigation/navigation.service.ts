import { getActiveRootCategoriesService } from "../category/category.service";
import { getCollectionsByTypeService } from "../collection/collection.service";
import {
  clearNavigationCache,
  getNavigationCache,
  setNavigationCache,
} from "./navigation.cache";
import {
  NavigationCategoryItem,
  NavigationCollectionItem,
  NavigationResponse,
} from "./navigation.types";

export const getNavigationService = async (): Promise<NavigationResponse> => {
  // Try to get from cache first
  const cached = await getNavigationCache();
  if (cached) {
    return cached;
  }

  // Fetch from database
  const [newCollections, trendingCollections, saleCollections, categories] =
    await Promise.all([
      getCollectionsByTypeService("new"),
      getCollectionsByTypeService("trending"),
      getCollectionsByTypeService("sale"),
      getActiveRootCategoriesService(),
    ]);

  const collectionItems: NavigationCollectionItem[] = [
    ...newCollections.map((col) => ({
      type: "collection" as const,
      name: col.name,
      slug: col.slug,
    })),
    ...trendingCollections.map((col) => ({
      type: "collection" as const,
      name: col.name,
      slug: col.slug,
    })),
    ...saleCollections.map((col) => ({
      type: "collection" as const,
      name: col.name,
      slug: col.slug,
    })),
  ];

  const categoryItems: NavigationCategoryItem[] = categories.map((cat) => ({
    type: "category" as const,
    name: cat.name,
    slug: cat.slug,
  }));

  const result: NavigationResponse = {
    collections: collectionItems,
    categories: categoryItems,
  };

  // Cache the result
  await setNavigationCache(result);

  return result;
};

/**
 * Invalidate navigation cache
 * Call this when categories or collections are updated
 */
export const invalidateNavigationCache = async (): Promise<void> => {
  await clearNavigationCache();
};
