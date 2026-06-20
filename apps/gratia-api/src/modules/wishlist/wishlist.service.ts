import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import {
  addToWishlist,
  countWishlistByUserId,
  findWishlistByUserId,
  findWishlistProductIdsByUserId,
  productExistsById,
  removeFromWishlist,
  type WishlistEntryRow,
} from "./wishlist.repository";

export interface UserWishlistResponse {
  items: WishlistEntryRow[];
  count: number;
}

export interface WishlistAddResponse {
  productId: number;
  addedAt: Date;
}

export interface WishlistCheckResponse {
  productIds: number[];
}

export interface WishlistCountResponse {
  count: number;
}

export const getUserWishlist = async (
  userId: number,
): Promise<UserWishlistResponse> => {
  const items = await findWishlistByUserId(userId);

  return {
    items,
    count: items.length,
  };
};

export const addProductToWishlist = async (
  userId: number,
  productId: number,
): Promise<WishlistAddResponse> => {
  const exists = await productExistsById(productId);
  if (!exists) {
    throw new AppError("Product not found", ErrorCode.NOT_FOUND, 404);
  }

  const item = await addToWishlist(userId, productId);

  return {
    productId: item.productId,
    addedAt: item.createdAt,
  };
};

export const removeProductFromWishlist = async (
  userId: number,
  productId: number,
): Promise<void> => {
  await removeFromWishlist(userId, productId);
};

export const checkWishlistProductIds = async (
  userId: number,
  productIds: number[],
): Promise<WishlistCheckResponse> => {
  const matched = await findWishlistProductIdsByUserId(userId, productIds);
  return { productIds: matched };
};

export const getUserWishlistCount = async (
  userId: number,
): Promise<WishlistCountResponse> => {
  const count = await countWishlistByUserId(userId);
  return { count };
};
