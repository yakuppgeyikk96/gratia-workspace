import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../../config/postgres.config";
import {
  type Cart,
  type CartItem,
  cartItems,
  carts,
  type NewCartItem,
} from "../../../db/schema/cart.schema";
import { products, type Product } from "../../../db/schema/product.schema";
import type { CartProductData, StoredCartItem } from "../cart.types";

// ============================================================================
// Cart V2 Repository - Database Operations
// ============================================================================

// ============================================================================
// Cart Operations
// ============================================================================

/**
 * Find cart by user ID
 */
export const findCartByUserId = async (userId: number): Promise<Cart | null> => {
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  return cart || null;
};

/**
 * Find or create cart for user
 * Uses INSERT ... ON CONFLICT DO NOTHING for atomic upsert operation
 */
export const findOrCreateCart = async (userId: number): Promise<Cart> => {
  // First try to find existing cart (most common case, avoids unnecessary insert)
  const existingCart = await findCartByUserId(userId);
  if (existingCart) return existingCart;

  // If no cart exists, try to create one with conflict handling
  // This handles race conditions where two requests try to create a cart simultaneously
  const [newCart] = await db
    .insert(carts)
    .values({
      userId,
      totalItems: 0,
      totalPrice: "0",
    })
    .onConflictDoNothing({ target: carts.userId })
    .returning();

  // If insert succeeded, return the new cart
  if (newCart) {
    return newCart;
  }

  // If conflict occurred (another request created the cart), fetch it
  const cart = await findCartByUserId(userId);
  if (cart) return cart;

  // This should never happen, but throw if cart still not found
  throw new Error(`Failed to find or create cart for user ${userId}`);
};

/**
 * Create a new cart for user (public API)
 * @deprecated Use findOrCreateCart instead to handle race conditions
 */
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

/**
 * Get all items for a cart
 */
export const getCartItems = async (cartId: number): Promise<CartItem[]> => {
  return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
};

/**
 * Find cart with items by user ID
 */
export const findCartWithItemsByUserId = async (
  userId: number
): Promise<{ cart: Cart; items: CartItem[] } | null> => {
  const cart = await findCartByUserId(userId);
  if (!cart) return null;
  const items = await getCartItems(cart.id);
  return { cart, items };
};

/**
 * Find or create cart with items
 */
export const findOrCreateCartWithItems = async (
  userId: number
): Promise<{ cart: Cart; items: CartItem[] }> => {
  const cart = await findOrCreateCart(userId);
  const items = await getCartItems(cart.id);
  return { cart, items };
};

// ============================================================================
// Cart Item Operations
// ============================================================================

/**
 * Find cart item by SKU
 */
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

/**
 * Add item to cart
 */
export const addItemToCart = async (
  cartId: number,
  item: Omit<NewCartItem, "cartId">
): Promise<CartItem> => {
  const [inserted] = await db
    .insert(cartItems)
    .values({
      cartId,
      ...item,
    })
    .returning();

  if (!inserted) {
    throw new Error("Failed to add item to cart");
  }

  return inserted;
};

/**
 * Update cart item quantity
 */
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

/**
 * Update cart item by SKU
 */
export const updateCartItemBySku = async (
  cartId: number,
  sku: string,
  quantity: number
): Promise<void> => {
  await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.sku, sku)));
};

/**
 * Remove cart item by ID
 */
export const removeCartItemById = async (itemId: number): Promise<void> => {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
};

/**
 * Remove cart item by SKU
 */
export const removeCartItemBySku = async (
  cartId: number,
  sku: string
): Promise<void> => {
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.sku, sku)));
};

/**
 * Clear all cart items
 */
export const clearCartItems = async (cartId: number): Promise<void> => {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
};

/**
 * Batch insert cart items
 */
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

// ============================================================================
// Cart Totals Operations
// ============================================================================

/**
 * Calculate cart totals from items
 */
const calculateCartTotals = (
  items: CartItem[]
): { totalItems: number; totalPrice: string } => {
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

/**
 * Recalculate and update cart totals
 */
export const recalculateAndUpdateCart = async (
  cartId: number
): Promise<{ cart: Cart; items: CartItem[] }> => {
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

  return { cart: updatedCart, items };
};

/**
 * Clear cart and reset totals
 */
export const clearAndResetCart = async (
  cartId: number
): Promise<{ cart: Cart; items: CartItem[] }> => {
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

  return { cart: updatedCart, items: [] };
};

// ============================================================================
// Product Operations (for cart validation)
// ============================================================================

/**
 * Find product by SKU
 */
export const findProductBySku = async (sku: string): Promise<Product | null> => {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  return product || null;
};

/**
 * Find products by SKUs (batch)
 */
export const findProductsBySkus = async (
  skus: string[]
): Promise<Map<string, Product>> => {
  if (skus.length === 0) {
    return new Map();
  }

  const uniqueSkus = [...new Set(skus)];
  const foundProducts = await db
    .select()
    .from(products)
    .where(inArray(products.sku, uniqueSkus));

  const productMap = new Map<string, Product>();
  foundProducts.forEach((p) => productMap.set(p.sku, p));

  return productMap;
};

/**
 * Find products by IDs (batch)
 */
export const findProductsByIds = async (
  productIds: number[]
): Promise<Map<number, Product>> => {
  if (productIds.length === 0) {
    return new Map();
  }

  const uniqueIds = [...new Set(productIds)];
  const foundProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, uniqueIds));

  const productMap = new Map<number, Product>();
  foundProducts.forEach((p) => productMap.set(p.id, p));

  return productMap;
};

/**
 * Convert Product to CartProductData
 */
export const toCartProductData = (product: Product): CartProductData => {
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    price: product.price,
    discountedPrice: product.discountedPrice,
    stock: product.stock,
    isActive: product.isActive,
    images: (product.images as string[]) || [],
    attributes: (product.attributes as Record<string, string>) || {},
    isVariant: !!product.productGroupId,
  };
};

// ============================================================================
// Stock Operations
// ============================================================================

/**
 * Decrease product stock (for checkout commit)
 */
export const decreaseProductStock = async (
  items: { sku: string; quantity: number }[]
): Promise<void> => {
  if (items.length === 0) return;

  // Use transaction with pessimistic locking for atomicity
  await db.transaction(async (tx) => {
    for (const item of items) {
      // SELECT ... FOR UPDATE to prevent concurrent reads from seeing stale stock
      const result = await tx.execute<{ stock: number }>(
        sql`SELECT stock FROM products WHERE sku = ${item.sku} LIMIT 1 FOR UPDATE`
      );

      const product = result[0];

      if (!product) {
        throw new Error(`Product not found: ${item.sku}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.sku}`);
      }

      await tx
        .update(products)
        .set({
          stock: product.stock - item.quantity,
          updatedAt: new Date(),
        })
        .where(eq(products.sku, item.sku));
    }
  });
};

// ============================================================================
// Conversion Helpers
// ============================================================================

/**
 * Convert CartItem to StoredCartItem
 */
export const toStoredCartItem = (item: CartItem): StoredCartItem => {
  return {
    sku: item.sku,
    productId: item.productId,
    quantity: item.quantity,
    originalPrice: item.price,
    addedAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
};

/**
 * Convert StoredCartItem to NewCartItem (for DB insert)
 */
export const toNewCartItem = (
  item: StoredCartItem,
  product: CartProductData
): Omit<NewCartItem, "cartId"> => {
  return {
    productId: item.productId,
    sku: item.sku,
    productName: product.name,
    productImages: product.images,
    price: product.price,
    discountedPrice: product.discountedPrice,
    quantity: item.quantity,
    attributes: product.attributes,
    isVariant: product.isVariant,
  };
};