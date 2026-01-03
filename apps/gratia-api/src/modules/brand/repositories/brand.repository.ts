import Brand, { BrandDoc } from "../../../shared/models/brand.model";
import { CreateBrandDto } from "../validations";

export const createBrand = async (
  brandData: CreateBrandDto
): Promise<BrandDoc> => {
  const brand = new Brand(brandData);
  return await brand.save();
};

export const findBrandById = async (id: string): Promise<BrandDoc | null> => {
  return await Brand.findById(id);
};

export const findBrandBySlug = async (
  slug: string
): Promise<BrandDoc | null> => {
  return await Brand.findOne({ slug: slug.toLowerCase() });
};

export const findAllBrands = async (): Promise<BrandDoc[]> => {
  return await Brand.find().sort({ name: 1 });
};

export const findActiveBrands = async (): Promise<BrandDoc[]> => {
  return await Brand.find({ isActive: true }).sort({ name: 1 });
};

export const updateBrand = async (
  id: string,
  data: Partial<BrandDoc>
): Promise<BrandDoc | null> => {
  return await Brand.findByIdAndUpdate(id, data, { new: true });
};