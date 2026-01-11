import type { ProductAttributes } from "../../../db/schema/product.schema";

interface CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  sku: string;
  vendorId?: string;
  brandId?: string;
  categoryId: string;
  collectionSlugs?: string[];
  price: number;
  discountedPrice?: number;
  stock: number;
  attributes?: ProductAttributes;
  images?: string[];
  productGroupId?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export default CreateProductDto;
