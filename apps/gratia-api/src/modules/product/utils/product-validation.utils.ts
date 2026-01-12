import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { findBrandById } from "../../brand/brand.repository";
import { findCategoryById } from "../../category/category.repository";
import { findCollectionBySlug } from "../../collection/collection.repository";
import { findVendorById } from "../../vendor/vendor.repository";
import { PRODUCT_MESSAGES } from "../product.constants";
import { findProductBySku, findProductBySlug } from "../product.repository";

/**
 * Validates that the product slug is unique
 * @throws AppError if slug already exists
 */
export const validateUniqueSlug = async (slug: string): Promise<void> => {
  const existingProduct = await findProductBySlug(slug);
  if (existingProduct) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }
};

/**
 * Validates that the product SKU is unique
 * @throws AppError if SKU already exists
 */
export const validateUniqueSku = async (sku: string): Promise<void> => {
  const existingSku = await findProductBySku(sku);
  if (existingSku) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_SKU_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }
};

/**
 * Validates that the category exists
 * @throws AppError if category not found
 */
export const validateCategoryExists = async (
  categoryId: number
): Promise<void> => {
  const category = await findCategoryById(categoryId);
  if (!category) {
    throw new AppError(
      PRODUCT_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }
};

/**
 * Validates that the brand exists (if provided)
 * @returns The brand ID or null
 * @throws AppError if brand ID is provided but not found
 */
export const validateBrandExists = async (
  brandId?: number
): Promise<number | null> => {
  if (!brandId) return null;

  const brand = await findBrandById(brandId);
  if (!brand) {
    throw new AppError(PRODUCT_MESSAGES.BRAND_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return brandId;
};

/**
 * Validates that the vendor exists (if provided)
 * @returns The vendor ID or null
 * @throws AppError if vendor ID is provided but not found
 */
export const validateVendorExists = async (
  vendorId?: number
): Promise<number | null> => {
  if (!vendorId) return null;

  const vendor = await findVendorById(vendorId);
  if (!vendor) {
    throw new AppError(PRODUCT_MESSAGES.VENDOR_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return vendorId;
};

/**
 * Validates that all collection slugs exist
 * @throws AppError if any collection is not found
 */
export const validateCollectionsExist = async (
  collectionSlugs: string[]
): Promise<void> => {
  if (!collectionSlugs || collectionSlugs.length === 0) return;

  // Validate all collections in parallel
  await Promise.all(
    collectionSlugs.map(async (collectionSlug) => {
      const collection = await findCollectionBySlug(collectionSlug);
      if (!collection) {
        throw new AppError(
          PRODUCT_MESSAGES.COLLECTION_NOT_FOUND,
          ErrorCode.NOT_FOUND
        );
      }
    })
  );
};

/**
 * Generates a unique product group ID
 */
export const generateProductGroupId = (providedId?: string): string => {
  if (providedId) return providedId;

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `pg_${timestamp}_${random}`;
};