import { Product } from "../../db/schema/product.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { PRODUCT_LIMITS, PRODUCT_MESSAGES } from "./product.constants";
import {
  buildCategoryPath,
  createProduct,
  extractFilterOptions,
  findFeaturedProducts,
  findProductById,
  findProductByIdWithDetails,
  findProductBySlug,
  findProducts,
  findProductsByGroupId,
} from "./product.repository";
import type { CreateProductDto } from "./product.validations";
import type ProductQueryOptionsDto from "./types/ProductQueryOptionsDto";
import type ProductsResponseDto from "./types/ProductsResponseDto";
import type ProductWithVariantsDto from "./types/ProductWithVariantsDto";
import { buildProductInsertData } from "./utils/product-builder.utils";
import {
  generateProductGroupId,
  validateBrandExists,
  validateCategoryExists,
  validateCollectionsExist,
  validateUniqueSku,
  validateUniqueSlug,
  validateVendorExists,
} from "./utils/product-validation.utils";

export const createProductService = async (
  data: CreateProductDto
): Promise<Product> => {
  // Run mandatory validations in parallel
  await Promise.all([
    validateUniqueSlug(data.slug),
    validateUniqueSku(data.sku),
    validateCategoryExists(data.categoryId),
  ]);

  // Run optional relationship validations in parallel
  const [brandIdNumber, vendorIdNumber] = await Promise.all([
    validateBrandExists(data.brandId),
    validateVendorExists(data.vendorId),
  ]);

  // Run collection validation
  await validateCollectionsExist(data.collectionSlugs || []);

  // Generate metadata
  const categoryPath = await buildCategoryPath(data.categoryId);
  const productGroupId = generateProductGroupId(data.productGroupId);

  // Build product data using builder
  const productData = buildProductInsertData(data, {
    categoryPath,
    productGroupId,
    brandId: brandIdNumber,
    vendorId: vendorIdNumber,
  });

  const product = await createProduct(productData);

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
  limit: number = PRODUCT_LIMITS.FEATURED_DEFAULT
): Promise<Product[]> => {
  // Clamp limit between min and max values
  const clampedLimit = Math.min(
    Math.max(limit, PRODUCT_LIMITS.FEATURED_MIN),
    PRODUCT_LIMITS.FEATURED_MAX
  );

  return await findFeaturedProducts(clampedLimit);
};
