import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { BrandDoc } from "../../../shared/models/brand.model";
import { BRAND_MESSAGES } from "../constants";
import {
  createBrand,
  findActiveBrands,
  findAllBrands,
  findBrandById,
  findBrandBySlug,
  updateBrand,
} from "../repositories";
import { CreateBrandDto } from "../validations";

export const createBrandService = async (
  data: CreateBrandDto
): Promise<BrandDoc> => {
  /**
   * Check if the brand slug already exists
   */
  const existingSlug = await findBrandBySlug(data.slug);
  if (existingSlug) {
    throw new AppError(
      BRAND_MESSAGES.BRAND_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  /**
   * Create the brand
   */
  const brand = await createBrand(data);
  if (!brand) {
    throw new AppError(
      BRAND_MESSAGES.BRAND_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return brand;
};

export const getBrandsService = async (): Promise<BrandDoc[]> => {
  return await findAllBrands();
};

export const getActiveBrandsService = async (): Promise<BrandDoc[]> => {
  return await findActiveBrands();
};

export const getBrandByIdService = async (id: string): Promise<BrandDoc> => {
  const brand = await findBrandById(id);

  if (!brand) {
    throw new AppError(BRAND_MESSAGES.BRAND_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return brand;
};

export const getBrandBySlugService = async (slug: string): Promise<BrandDoc> => {
  const brand = await findBrandBySlug(slug);

  if (!brand) {
    throw new AppError(BRAND_MESSAGES.BRAND_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return brand;
};

export const updateBrandService = async (
  id: string,
  data: Partial<BrandDoc>
): Promise<BrandDoc> => {
  const brand = await updateBrand(id, data);

  if (!brand) {
    throw new AppError(
      BRAND_MESSAGES.BRAND_UPDATE_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return brand;
};