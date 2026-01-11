import { Product, ProductAttributes } from "../../db/schema/product.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { findBrandById } from "../brand/brand.repository";
import { findCategoryById } from "../category/category.repository";
import { findCollectionBySlug } from "../collection/collection.repository";
import { findVendorById } from "../vendor/vendor.repository";
import { PRODUCT_MESSAGES } from "./product.constants";
import {
  buildCategoryPath,
  createProduct,
  extractFilterOptions,
  findFeaturedProducts,
  findProductById,
  findProductByIdWithDetails,
  findProductBySku,
  findProductBySlug,
  findProducts,
  findProductsByGroupId,
} from "./product.repository";
import type { CreateProductDto } from "./product.validations";
import type ProductQueryOptionsDto from "./types/ProductQueryOptionsDto";
import type ProductsResponseDto from "./types/ProductsResponseDto";
import type ProductWithVariantsDto from "./types/ProductWithVariantsDto";

export const createProductService = async (
  data: CreateProductDto
): Promise<Product> => {
  // Check if product slug already exists
  const existingProduct = await findProductBySlug(data.slug);
  if (existingProduct) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  // Check if product SKU already exists
  const existingSku = await findProductBySku(data.sku);
  if (existingSku) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_SKU_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  // Validate categoryId
  const category = await findCategoryById(data.categoryId);
  if (!category) {
    throw new AppError(
      PRODUCT_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  // Validate brandId (if provided)
  let brandIdNumber: number | null = null;
  if (data.brandId) {
    const brand = await findBrandById(data.brandId);
    if (!brand) {
      throw new AppError("Brand not found", ErrorCode.NOT_FOUND);
    }
    brandIdNumber = data.brandId;
  }

  // Validate vendorId (if provided)
  let vendorIdNumber: number | null = null;
  if (data.vendorId) {
    const vendor = await findVendorById(data.vendorId);
    if (!vendor) {
      throw new AppError("Vendor not found", ErrorCode.NOT_FOUND);
    }
    vendorIdNumber = data.vendorId;
  }

  // Validate collections (if provided) - TODO: Replace with collection repository when migrated
  if (data.collectionSlugs && data.collectionSlugs.length > 0) {
    for (const collectionSlug of data.collectionSlugs) {
      const collection = await findCollectionBySlug(collectionSlug);
      if (!collection) {
        throw new AppError(
          `Collection with slug '${collectionSlug}' not found`,
          ErrorCode.NOT_FOUND
        );
      }
    }
  }

  // Build category path
  const categoryPath = await buildCategoryPath(data.categoryId);

  // Generate productGroupId if not provided
  const productGroupId =
    data.productGroupId ||
    `pg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create the product
  const product = await createProduct({
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    sku: data.sku,
    categoryId: data.categoryId,
    brandId: brandIdNumber,
    vendorId: vendorIdNumber,
    categoryPath,
    collectionSlugs: data.collectionSlugs || [],
    price: data.price,
    discountedPrice: data.discountedPrice || null,
    stock: data.stock,
    attributes: (data.attributes || {}) as ProductAttributes & {
      color?: string;
      size?: string;
      material?: string;
    },
    images: data.images || [],
    productGroupId,
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
    isActive: data.isActive ?? true,
  });

  if (!product) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return product;
};

export const getProductsService = async (
  options: ProductQueryOptionsDto,
  withDetails = false
): Promise<ProductsResponseDto> => {
  if (!options.categorySlug && !options.collectionSlug) {
    throw new AppError(
      PRODUCT_MESSAGES.CATEGORY_OR_COLLECTION_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  const { products, total } = await findProducts(options, withDetails);

  const filterOptions = await extractFilterOptions(
    options.categorySlug,
    options.collectionSlug
  );

  const page = options.page || 1;
  const limit = options.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    products,
    filters: filterOptions,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
    sortOptions: ["newest", "price-low", "price-high", "name"],
  };
};

export const getProductByIdService = async (
  id: string,
  withDetails = false
): Promise<Product> => {
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
      ErrorCode.BAD_REQUEST
    );
  }

  const product = withDetails
    ? await findProductByIdWithDetails(productId)
    : await findProductById(productId);

  if (!product) {
    throw new AppError(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return product;
};

export const getProductWithVariantsService = async (
  slug: string
): Promise<ProductWithVariantsDto> => {
  const product = await findProductBySlug(slug);
  if (!product) {
    throw new AppError(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  const variants = await findProductsByGroupId(product.productGroupId);

  const colors = new Set<string>();
  const sizes = new Set<string>();
  const materials = new Set<string>();

  variants.forEach((v) => {
    if (v.attributes?.color) colors.add(v.attributes.color);
    if (v.attributes?.size) sizes.add(v.attributes.size);
    if (v.attributes?.material) materials.add(v.attributes.material);
  });

  const availableOptions = {
    colors: Array.from(colors).sort(),
    sizes: Array.from(sizes).sort(),
    materials: Array.from(materials).sort(),
  };

  return {
    product,
    variants,
    availableOptions,
  };
};

export const getFeaturedProductsService = async (
  limit: number = 10
): Promise<Product[]> => {
  return await findFeaturedProducts(limit);
};
