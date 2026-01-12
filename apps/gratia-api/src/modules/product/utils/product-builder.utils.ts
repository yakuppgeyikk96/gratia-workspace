import type { ProductAttributes } from "../../../db/schema/product.schema";
import type { CreateProductDto } from "../product.validations";

export interface ProductInsertData {
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  categoryId: number;
  brandId: number | null;
  vendorId: number | null;
  categoryPath: string;
  collectionSlugs: string[];
  price: number;
  discountedPrice: number | null;
  stock: number;
  attributes: ProductAttributes;
  images: string[];
  productGroupId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
}

export const buildProductInsertData = (
  dto: CreateProductDto,
  metadata: {
    categoryPath: string;
    productGroupId: string;
    brandId: number | null;
    vendorId: number | null;
  }
): ProductInsertData => {
  return {
    name: dto.name,
    slug: dto.slug,
    description: dto.description || null,
    sku: dto.sku,
    categoryId: dto.categoryId,
    brandId: metadata.brandId,
    vendorId: metadata.vendorId,
    categoryPath: metadata.categoryPath,
    collectionSlugs: dto.collectionSlugs || [],
    price: dto.price,
    discountedPrice: dto.discountedPrice || null,
    stock: dto.stock,
    attributes: (dto.attributes || {}) as ProductAttributes,
    images: dto.images || [],
    productGroupId: metadata.productGroupId,
    metaTitle: dto.metaTitle || null,
    metaDescription: dto.metaDescription || null,
    isActive: dto.isActive ?? true,
  };
};
