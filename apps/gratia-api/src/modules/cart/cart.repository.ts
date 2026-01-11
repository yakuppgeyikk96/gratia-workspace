import { and, eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type Cart,
  type CartItem,
  cartItems,
  carts,
  NewCartItem,
} from "../../db/schema/cart.schema";
import { CartWithItems } from "./cart.types";

export const findCartByUserId = async (
  userId: number
): Promise<Cart | null> => {
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  return cart || null;
};

export const createCart = async (userId: number): Promise<Cart | null> => {
  const [cart] = await db
    .insert(carts)
    .values({
      userId,
      totalItems: 0,
      totalPrice: "0",
    })
    .returning();

  return cart || null;
};

export const findOrCreateCart = async (
  userId: number
): Promise<Cart | null> => {
  let cart = await findCartByUserId(userId);

  if (!cart) {
    cart = await createCart(userId);
  }

  return cart || null;
};

export const findCartById = async (cartId: number): Promise<Cart | null> => {
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.id, cartId))
    .limit(1);

  return cart || null;
};

export const getCartItems = async (cartId: number): Promise<CartItem[]> => {
  return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
};

export const findCartItemBySku = async (
  cartId: number,
  sku: string
): Promise<CartItem | null> => {
  const [item] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.sku, sku)))
    .limit(1);

  return item || null;
};

export const findCartWithItemsByUserId = async (
  userId: number
): Promise<CartWithItems | null> => {
  const cart = await findCartByUserId(userId);
  if (!cart) return null;

  const items = await getCartItems(cart.id);

  return { ...cart, items };
};

export const findCartWithItemsById = async (
  cartId: number
): Promise<CartWithItems | null> => {
  const cart = await findCartById(cartId);
  if (!cart) return null;

  const items = await getCartItems(cart.id);

  return { ...cart, items };
};

export const findOrCreateCartWithItems = async (
  userId: number
): Promise<CartWithItems> => {
  let cart = await findCartByUserId(userId);

  if (!cart) {
    cart = await createCart(userId);
    if (!cart) {
      throw new Error("Failed to create cart");
    }
  }

  const items = await getCartItems(cart.id);

  return { ...cart, items };
};

const recalculateCartTotals = async (cartId: number): Promise<void> => {
  // Get all items
  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = item.discountedPrice
      ? parseFloat(item.discountedPrice)
      : parseFloat(item.price);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Update cart
  await db
    .update(carts)
    .set({
      totalItems,
      totalPrice: totalPrice.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId));
};

export const addItemToCart = async (
  userId: number,
  item: Omit<NewCartItem, "cartId">
): Promise<CartWithItems | null> => {
  // 1. Find or create cart
  let cart = await findOrCreateCart(userId);

  if (!cart) {
    return null;
  }

  // 2. Insert cart item
  await db.insert(cartItems).values({
    cartId: cart.id,
    productId: item.productId,
    sku: item.sku,
    productName: item.productName,
    productImages: item.productImages,
    price: item.price,
    discountedPrice: item.discountedPrice,
    quantity: item.quantity,
    attributes: item.attributes,
    isVariant: item.isVariant,
  });

  // 3. Recalculate totals (Mongoose pre-save hook equivalent)
  await recalculateCartTotals(cart.id);

  // 4. Return updated cart with items
  return await findCartWithItemsById(cart.id);
};

export const updateCartItem = async (
  userId: number,
  sku: string,
  item: Partial<Omit<NewCartItem, "cartId">>
): Promise<CartWithItems | null> => {
  // 1. Find cart
  const cart = await findCartByUserId(userId);
  if (!cart) return null;

  // 2. Find cart item by SKU
  const [existingItem] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.sku, sku)))
    .limit(1);

  if (!existingItem) return null;

  // 3. Update cart item
  await db
    .update(cartItems)
    .set({
      ...item,
      updatedAt: new Date(),
    })
    .where(eq(cartItems.id, existingItem.id));

  // 4. Recalculate totals
  await recalculateCartTotals(cart.id);

  // 5. Return updated cart with items
  return await findCartWithItemsById(cart.id);
};

export const removeItemFromCart = async (
  userId: number,
  sku: string
): Promise<CartWithItems | null> => {
  // 1. Find cart
  const cart = await findCartByUserId(userId);
  if (!cart) return null;

  // 2. Find cart item by SKU
  const [itemToDelete] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.sku, sku)))
    .limit(1);

  if (!itemToDelete) return null;

  // 3. Delete cart item
  await db.delete(cartItems).where(eq(cartItems.id, itemToDelete.id));

  // 4. Recalculate totals
  await recalculateCartTotals(cart.id);

  // 5. Return updated cart with items
  return await findCartWithItemsById(cart.id);
};

export const clearCart = async (
  userId: number
): Promise<CartWithItems | null> => {
  // 1. Find cart
  const cart = await findCartByUserId(userId);
  if (!cart) return null;

  // 2. Delete all cart items
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

  // 3. Reset totals to 0
  await db
    .update(carts)
    .set({
      totalItems: 0,
      totalPrice: "0",
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cart.id));

  // 4. Return updated cart with items (empty array)
  return await findCartWithItemsById(cart.id);
};
