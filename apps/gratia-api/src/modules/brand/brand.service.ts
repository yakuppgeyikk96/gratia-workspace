import { Brand } from "../../db/schema/brand.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
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

  return brand;
};

export const getBrandsService = async (): Promise<Brand[]> => {
  return await findAllBrands();
};

export const getActiveBrandsService = async (): Promise<Brand[]> => {
  return await findActiveBrands();
};

export const getBrandByIdService = async (id: number): Promise<Brand> => {
  const brand = await findBrandById(id);

  if (!brand) {
    throw new AppError(BRAND_MESSAGES.BRAND_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return brand;
};

export const getBrandBySlugService = async (slug: string): Promise<Brand> => {
  const brand = await findBrandBySlug(slug);

  if (!brand) {
    throw new AppError(BRAND_MESSAGES.BRAND_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

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

  return brand;
};
