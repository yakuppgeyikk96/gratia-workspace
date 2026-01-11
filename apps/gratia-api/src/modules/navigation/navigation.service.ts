import { getActiveRootCategoriesService } from "../category/category.service";
import { getCollectionsByTypeService } from "../collection/collection.service";
import {
  NavigationCategoryItem,
  NavigationCollectionItem,
  NavigationResponse,
} from "./navigation.types";

export const getNavigationService = async (): Promise<NavigationResponse> => {
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

  return {
    collections: collectionItems,
    categories: categoryItems,
  };
};
