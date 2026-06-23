import { Brand } from "../../db/schema/brand.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import {
  activeKey,
  allKey,
  brandItemCache,
  brandListCache,
  byIdKey,
  bySlugKey,
  invalidateAllBrandCaches,
} from "./brand.cache";
import { BRAND_MESSAGES } from "./brand.constants";
import {
  createBrand,
  findActiveBrands,
  findAllBrands,
  findBrandById,
  findBrandBySlug,
  updateBrand,
} from "./brand.repository";
import type { CreateBrandDto, UpdateBrandDto } from "./brand.validations";

const writeListCache = (key: string, value: Brand[]): void => {
  brandListCache.set(key, value).catch((err) =>
    console.error("Brand list cache write failed:", err),
  );
};

const writeItemCache = (key: string, value: Brand): void => {
  brandItemCache.set(key, value).catch((err) =>
    console.error("Brand item cache write failed:", err),
  );
};

export const createBrandService = async (
  data: CreateBrandDto
): Promise<Brand> => {
  const existingSlug = await findBrandBySlug(data.slug);
  if (existingSlug) {
    throw new AppError(
      BRAND_MESSAGES.BRAND_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  const brand = await createBrand({
    name: data.name,
    slug: data.slug,
    description: data.description,
    logo: data.logo,
    isActive: data.isActive ?? true,
  });

  if (!brand) {
    throw new AppError(
      BRAND_MESSAGES.BRAND_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  invalidateAllBrandCaches().catch((err) =>
    console.error("Brand cache invalidation failed:", err),
  );

  return brand;
};

export const getBrandsService = async (): Promise<Brand[]> => {
  const cached = await brandListCache.get(allKey());
  if (cached) return cached;

  const result = await findAllBrands();
  writeListCache(allKey(), result);
  return result;
};

export const getActiveBrandsService = async (): Promise<Brand[]> => {
  const cached = await brandListCache.get(activeKey());
  if (cached) return cached;

  const result = await findActiveBrands();
  writeListCache(activeKey(), result);
  return result;
};

export const getBrandByIdService = async (id: number): Promise<Brand> => {
  const cacheKey = byIdKey(id);
  const cached = await brandItemCache.get(cacheKey);
  if (cached) return cached;

  const brand = await findBrandById(id);

  if (!brand) {
    throw new AppError(BRAND_MESSAGES.BRAND_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  writeItemCache(cacheKey, brand);
  return brand;
};

export const getBrandBySlugService = async (slug: string): Promise<Brand> => {
  const cacheKey = bySlugKey(slug);
  const cached = await brandItemCache.get(cacheKey);
  if (cached) return cached;

  const brand = await findBrandBySlug(slug);

  if (!brand) {
    throw new AppError(BRAND_MESSAGES.BRAND_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  writeItemCache(cacheKey, brand);
  return brand;
};

export const updateBrandService = async (
  id: number,
  data: UpdateBrandDto
): Promise<Brand> => {
  // Filter out undefined values to match repository type expectations
  const updateData: Partial<{
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    isActive: boolean;
  }> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined)
    updateData.description = data.description || null;
  if (data.logo !== undefined) updateData.logo = data.logo || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const brand = await updateBrand(id, updateData);

  if (!brand) {
    throw new AppError(
      BRAND_MESSAGES.BRAND_UPDATE_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  invalidateAllBrandCaches().catch((err) =>
    console.error("Brand cache invalidation failed:", err),
  );

  return brand;
};
