import { Cart, CartItem } from "../../db/schema/cart.schema";
import { Product } from "../../db/schema/product.schema";

export interface CartWithItems extends Cart {
  items: CartItem[];
}

export interface CartItemInput {
  productId: number;
  sku: string;
  quantity: number;
}

export interface ValidatedCartItem extends CartItemInput {
  product: Product;
}

export interface CartSyncError {
  sku: string;
  error: string;
}

export interface CartSyncResult {
  cart: CartWithItems;
  errors: CartSyncError[];
}

export interface BatchProductResult {
  found: Map<number, Product>;
  notFound: number[];
}

export interface CartItemUpdate {
  id: number;
  productName: string;
  productImages: string[];
  price: string;
  discountedPrice: string | null;
}
