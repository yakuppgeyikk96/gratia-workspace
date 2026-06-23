import type { Category } from "../../db/schema/category.schema";
import { createCache } from "../../shared/services";
import type { CategoryTreeNode } from "./category.types";

const CACHE_TTL = 600; // 10 minutes — categories change rarely

export const categoryListCache = createCache<Category[]>(
  "categories:list",
  CACHE_TTL,
);

export const categoryItemCache = createCache<Category>(
  "categories:item",
  CACHE_TTL,
);

export const categoryTreeCache = createCache<CategoryTreeNode[]>(
  "categories:tree",
  CACHE_TTL,
);

export const allKey = (): string => "all";
export const activeKey = (): string => "active";
export const rootKey = (): string => "active-root";
export const treeKey = (): string => "tree";
export const byIdKey = (id: number): string => `id:${id}`;
export const bySlugKey = (slug: string): string => `slug:${slug}`;
export const subKey = (parentId: number | null): string =>
  `parent:${parentId ?? "null"}`;

export const invalidateAllCategoryCaches = async (): Promise<void> => {
  await Promise.all([
    categoryListCache.invalidate(),
    categoryItemCache.invalidate(),
    categoryTreeCache.invalidate(),
  ]);
};
