import { IApiResponse } from "./Api.types";

export interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  discountedPrice: string | null;
  stock: number;
  images: string[];
}

export interface WishlistEntry {
  wishlistItemId: number;
  addedAt: string;
  product: WishlistProduct;
}

export interface Wishlist {
  items: WishlistEntry[];
  count: number;
}

export interface WishlistAddPayload {
  productId: number;
}

export interface WishlistAddResult {
  productId: number;
  addedAt: string;
}

export interface WishlistCheckResult {
  productIds: number[];
}

export interface WishlistCountResult {
  count: number;
}

export type WishlistResponse = IApiResponse<Wishlist>;
export type WishlistAddResponse = IApiResponse<WishlistAddResult>;
export type WishlistRemoveResponse = IApiResponse<null>;
export type WishlistCheckResponse = IApiResponse<WishlistCheckResult>;
export type WishlistCountResponse = IApiResponse<WishlistCountResult>;
