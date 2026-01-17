import { IApiResponse } from "./Api.types";
import { ProductAttributes } from "./Product.types";

export interface CartItem {
  id: number;
  productId: number;
  sku: string;
  quantity: number;
  price: string;
  discountedPrice?: string;
  productName: string;
  productImages: string[];
  attributes: ProductAttributes;
  isVariant: boolean;
  cartId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
}

export type CartResponse = IApiResponse<Cart>;

export interface UpdateCartItemDto {
  sku: string;
  quantity: number;
}

export interface AddToCartDto {
  productId: number;
  sku: string;
  quantity: number;
}

export interface SyncCartDto {
  items: AddToCartDto[];
}

export interface CartSyncError {
  sku: string;
  error: string;
}

export interface CartSyncResult {
  cart: Cart;
  errors: CartSyncError[];
}

export type CartSyncResponse = IApiResponse<CartSyncResult>;
