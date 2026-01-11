import { Cart, CartItem } from "../../db/schema/cart.schema";

export interface CartWithItems extends Cart {
  items: CartItem[];
}
