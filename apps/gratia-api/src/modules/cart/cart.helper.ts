import { NewCartItem } from "../../db/schema/cart.schema";
import { Product } from "../../db/schema/product.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { findProductById } from "../product/product.repository";
import { CART_MESSAGES } from "./cart.constants";

/**
 * Validates product existence, active status, and stock availability
 */
export const validateProductAndStock = async (
  productId: number,
  quantity: number
): Promise<Product> => {
  // 1. Check if product exists
  const product = await findProductById(productId);
  if (!product) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // 2. Check if product is active
  if (!product.isActive) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_ACTIVE, ErrorCode.BAD_REQUEST);
  }

  // 3. Validate stock availability
  if (product.stock < quantity) {
    throw new AppError(CART_MESSAGES.INSUFFICIENT_STOCK, ErrorCode.BAD_REQUEST);
  }

  return product;
};

/**
 * Builds a cart item from a ProductDoc and quantity
 * Note: productId will need to be converted to number when product module is migrated
 */
export const buildCartItem = (
  product: Product,
  quantity: number
): Omit<NewCartItem, "cartId" | "id" | "createdAt" | "updatedAt"> & {
  productId: number;
} => {
  const isVariant =
    !!product.productGroupId &&
    product.productGroupId !== `pg_${product.id.toString()}`;

  return {
    productId: product.id,
    sku: product.sku,
    quantity,
    price: product.price.toString(),
    ...(product.discountedPrice !== undefined && {
      discountedPrice: product.discountedPrice?.toString() || "",
    }),
    productName: product.name,
    productImages: product.images || [],
    attributes: product.attributes || {},
    isVariant,
  };
};

/**
 * Parses userId from string to number with validation
 */
export const parseUserId = (userId: string): number => {
  const parsed = parseInt(userId, 10);
  if (isNaN(parsed)) {
    throw new AppError("Invalid user ID", ErrorCode.BAD_REQUEST);
  }
  return parsed;
};
