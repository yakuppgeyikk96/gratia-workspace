import { Product } from "../../db/schema/product.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { getCategoryAttributeTemplate } from "../category-attribute-template/category-attribute-template.repository";
import { PRODUCT_LIMITS, PRODUCT_MESSAGES } from "./product.constants";
import {
  buildCategoryPath,
  createProduct,
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
import {
  validateProductAttributes,
  validateRequiredAttributes,
} from "./utils/attribute-validator";
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

  // Attribute validation - based on category template
  const template = await getCategoryAttributeTemplate(data.categoryId);
  if (template && template.attributeDefinitions.length > 0) {
    const attributes = data.attributes || {};

    // Check required attributes
    const requiredCheck = validateRequiredAttributes(
      attributes,
      template.attributeDefinitions
    );

    if (!requiredCheck.valid) {
      throw new AppError(
        `Missing required attributes: ${requiredCheck.missing.join(", ")}`,
        ErrorCode.BAD_REQUEST
      );
    }

    // Attribute validation
    const validation = validateProductAttributes(
      attributes,
      template.attributeDefinitions
    );

    if (!validation.valid) {
      throw new AppError(
        `Invalid product attributes: ${validation.errors.join(", ")}`,
        ErrorCode.BAD_REQUEST
      );
    }
  }

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

  // const filterOptions = await extractFilterOptions(
  //   options.categorySlug,
  //   options.collectionSlug
  // );

  const page = options.page || 1;
  const limit = options.limit || 12;
  const totalPages = Math.ceil(total / limit);

  return {
    products,
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

  // Get category template
  const template = await getCategoryAttributeTemplate(product.categoryId);

  // Create dynamic available options
  const availableOptions: Record<string, string[]> = {};

  if (template && template.attributeDefinitions.length > 0) {
    // Available options for enum type attributes in template
    for (const def of template.attributeDefinitions) {
      if (def.type === "enum" && def.enumValues) {
        const values = new Set<string>();
        variants.forEach((v) => {
          if (v.attributes?.[def.key]) {
            values.add(String(v.attributes[def.key]));
          }
        });
        availableOptions[def.key] = Array.from(values).sort();
      }
    }
  }

  return {
    product,
    variants,
    availableOptions,
    ...(template ? { attributeTemplate: template } : {}),
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
