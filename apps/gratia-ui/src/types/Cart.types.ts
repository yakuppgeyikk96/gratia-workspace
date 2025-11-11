import { IApiResponse } from "./Api.types";
import { ProductAttributes } from "./Product.types";

export interface CartItem {
  productId: string;
  sku: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
  productName: string;
  productImages: string[];
  attributes: ProductAttributes;
  isVariant: boolean;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export type CartResponse = IApiResponse<Cart>;

export interface UpdateCartItemDto {
  sku: string;
  quantity: number;
}

export interface AddToCartDto {
  productId: string;
  sku: string;
  quantity: number;
}

export interface SyncCartDto {
  items: AddToCartDto[];
}
