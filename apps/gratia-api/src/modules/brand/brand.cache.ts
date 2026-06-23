import type { Brand } from "../../db/schema/brand.schema";
import { createCache } from "../../shared/services";

const CACHE_TTL = 600; // 10 minutes — brands change rarely

export const brandListCache = createCache<Brand[]>(
  "brands:list",
  CACHE_TTL,
);

export const brandItemCache = createCache<Brand>(
  "brands:item",
  CACHE_TTL,
);

export const allKey = (): string => "all";
export const activeKey = (): string => "active";
export const byIdKey = (id: number): string => `id:${id}`;
export const bySlugKey = (slug: string): string => `slug:${slug}`;

export const invalidateAllBrandCaches = async (): Promise<void> => {
  await Promise.all([
    brandListCache.invalidate(),
    brandItemCache.invalidate(),
  ]);
};
