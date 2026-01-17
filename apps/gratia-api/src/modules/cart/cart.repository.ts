import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type Cart,
  type CartItem,
  cartItems,
  carts,
  NewCartItem,
} from "../../db/schema/cart.schema";
import { products, Product } from "../../db/schema/product.schema";
import { CartWithItems, BatchProductResult, CartItemUpdate } from "./cart.types";

export const findCartByUserId = async (userId: number): Promise<Cart | null> => {
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  return cart || null;
};

export const createCart = async (userId: number): Promise<Cart> => {
  const [cart] = await db
    .insert(carts)
    .values({
      userId,
      totalItems: 0,
      totalPrice: "0",
    })
    .returning();

  if (!cart) {
    throw new Error("Failed to create cart");
  }

  return cart;
};

export const findOrCreateCart = async (userId: number): Promise<Cart> => {
  const cart = await findCartByUserId(userId);
  if (cart) return cart;
  return createCart(userId);
};

export const getCartItems = async (cartId: number): Promise<CartItem[]> => {
  return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
};

export const findCartWithItemsByUserId = async (userId: number): Promise<CartWithItems | null> => {
  const cart = await findCartByUserId(userId);
  if (!cart) return null;
  const items = await getCartItems(cart.id);
  return { ...cart, items };
};

export const findOrCreateCartWithItems = async (userId: number): Promise<CartWithItems> => {
  const cart = await findOrCreateCart(userId);
  const items = await getCartItems(cart.id);
  return { ...cart, items };
};

export const findCartItemBySku = async (cartId: number, sku: string): Promise<CartItem | null> => {
  const [item] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.sku, sku)))
    .limit(1);

  return item || null;
};

export const findProductsByIds = async (productIds: number[]): Promise<BatchProductResult> => {
  if (productIds.length === 0) {
    return { found: new Map(), notFound: [] };
  }

  const uniqueIds = [...new Set(productIds)];
  const foundProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, uniqueIds));

  const productMap = new Map<number, Product>();
  foundProducts.forEach((p) => productMap.set(p.id, p));

  const notFound = uniqueIds.filter((id) => !productMap.has(id));

  return { found: productMap, notFound };
};

export const findActiveProductById = async (productId: number): Promise<Product | null> => {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.isActive, true)))
    .limit(1);

  return product || null;
};

const calculateCartTotals = (items: CartItem[]): { totalItems: number; totalPrice: string } => {
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of items) {
    totalItems += item.quantity;
    const price = item.discountedPrice
      ? parseFloat(item.discountedPrice)
      : parseFloat(item.price);
    totalPrice += price * item.quantity;
  }

  return {
    totalItems,
    totalPrice: totalPrice.toFixed(2),
  };
};

export const recalculateAndUpdateCart = async (cartId: number): Promise<CartWithItems> => {
  const items = await getCartItems(cartId);
  const { totalItems, totalPrice } = calculateCartTotals(items);

  const [updatedCart] = await db
    .update(carts)
    .set({
      totalItems,
      totalPrice,
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId))
    .returning();

  if (!updatedCart) {
    throw new Error("Failed to update cart");
  }

  return { ...updatedCart, items };
};

export const addItemToCart = async (
  cartId: number,
  item: Omit<NewCartItem, "cartId">
): Promise<void> => {
  await db.insert(cartItems).values({
    cartId,
    ...item,
  });
};

export const updateCartItemQuantity = async (
  itemId: number,
  quantity: number
): Promise<void> => {
  await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(eq(cartItems.id, itemId));
};

export const updateCartItemFull = async (
  itemId: number,
  data: Partial<Omit<NewCartItem, "cartId" | "id">>
): Promise<void> => {
  await db
    .update(cartItems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cartItems.id, itemId));
};

export const removeCartItemById = async (itemId: number): Promise<void> => {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
};

export const removeCartItemsBySku = async (cartId: number, skus: string[]): Promise<void> => {
  if (skus.length === 0) return;
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), inArray(cartItems.sku, skus)));
};

export const removeCartItemByIds = async (ids: number[]): Promise<void> => {
  if (ids.length === 0) return;
  await db.delete(cartItems).where(inArray(cartItems.id, ids));
};

export const batchUpdateCartItems = async (updates: CartItemUpdate[]): Promise<void> => {
  if (updates.length === 0) return;

  const updatePromises = updates.map((update) =>
    db
      .update(cartItems)
      .set({
        productName: update.productName,
        productImages: update.productImages,
        price: update.price,
        discountedPrice: update.discountedPrice,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, update.id))
  );

  await Promise.all(updatePromises);
};

export const clearCartItems = async (cartId: number): Promise<void> => {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
};

export const batchInsertCartItems = async (
  cartId: number,
  items: Omit<NewCartItem, "cartId">[]
): Promise<void> => {
  if (items.length === 0) return;

  const itemsWithCartId = items.map((item) => ({
    cartId,
    ...item,
  }));

  await db.insert(cartItems).values(itemsWithCartId);
};

export const clearAndResetCart = async (cartId: number): Promise<CartWithItems> => {
  await clearCartItems(cartId);

  const [updatedCart] = await db
    .update(carts)
    .set({
      totalItems: 0,
      totalPrice: "0",
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId))
    .returning();

  if (!updatedCart) {
    throw new Error("Failed to reset cart");
  }

  return { ...updatedCart, items: [] };
};

export const syncCartItems = async (
  cartId: number,
  items: Omit<NewCartItem, "cartId">[]
): Promise<CartWithItems> => {
  await clearCartItems(cartId);

  if (items.length > 0) {
    await batchInsertCartItems(cartId, items);
  }

  return recalculateAndUpdateCart(cartId);
};
