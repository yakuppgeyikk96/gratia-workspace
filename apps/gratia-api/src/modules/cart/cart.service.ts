import { Product } from "../../db/schema/product.schema";
import { NewCartItem } from "../../db/schema/cart.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { CART_LIMITS, CART_MESSAGES } from "./cart.constants";
import {
  findOrCreateCartWithItems,
  findProductsByIds,
  findActiveProductById,
  findCartItemBySku,
  addItemToCart,
  updateCartItemFull,
  removeCartItemByIds,
  batchUpdateCartItems,
  recalculateAndUpdateCart,
  clearAndResetCart,
  syncCartItems,
} from "./cart.repository";
import {
  CartWithItems,
  CartSyncResult,
  CartItemUpdate,
  ValidatedCartItem,
} from "./cart.types";
import type { AddToCartDto, SyncCartDto, UpdateCartItemDto } from "./cart.validations";

export const buildCartItem = (
  product: Product,
  quantity: number
): Omit<NewCartItem, "cartId" | "id" | "createdAt" | "updatedAt"> => {
  const isVariant =
    !!product.productGroupId &&
    product.productGroupId !== `pg_${product.id.toString()}`;

  return {
    productId: product.id,
    sku: product.sku,
    quantity,
    price: product.price.toString(),
    discountedPrice: product.discountedPrice?.toString() || null,
    productName: product.name,
    productImages: product.images || [],
    attributes: product.attributes || {},
    isVariant,
  };
};

const validateProductStock = (product: Product, quantity: number): void => {
  if (!product.isActive) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_ACTIVE, ErrorCode.BAD_REQUEST);
  }
  if (product.stock < quantity) {
    throw new AppError(CART_MESSAGES.INSUFFICIENT_STOCK, ErrorCode.BAD_REQUEST);
  }
};

export const getCartService = async (userId: number): Promise<CartWithItems> => {
  const cart = await findOrCreateCartWithItems(userId);

  if (cart.items.length === 0) {
    return cart;
  }

  const productIds = cart.items.map((item) => item.productId);
  const { found: productMap } = await findProductsByIds(productIds);

  const itemsToRemove: number[] = [];
  const itemsToUpdate: CartItemUpdate[] = [];
  const itemIdsToKeep = new Set<number>();

  for (const item of cart.items) {
    const product = productMap.get(item.productId);

    if (!product || !product.isActive) {
      itemsToRemove.push(item.id);
      continue;
    }

    itemIdsToKeep.add(item.id);

    const priceChanged = item.price !== product.price.toString();
    const discountChanged =
      (item.discountedPrice || null) !== (product.discountedPrice?.toString() || null);
    const nameChanged = item.productName !== product.name;
    const imagesChanged =
      JSON.stringify(item.productImages) !== JSON.stringify(product.images);

    if (priceChanged || discountChanged || nameChanged || imagesChanged) {
      itemsToUpdate.push({
        id: item.id,
        productName: product.name,
        productImages: product.images || [],
        price: product.price.toString(),
        discountedPrice: product.discountedPrice?.toString() || null,
      });
    }
  }

  if (itemsToRemove.length > 0 || itemsToUpdate.length > 0) {
    await Promise.all([
      removeCartItemByIds(itemsToRemove),
      batchUpdateCartItems(itemsToUpdate),
    ]);

    return recalculateAndUpdateCart(cart.id);
  }

  return cart;
};

export const addToCartService = async (
  userId: number,
  data: AddToCartDto
): Promise<CartWithItems> => {
  const { productId, sku, quantity } = data;

  const cart = await findOrCreateCartWithItems(userId);

  const existingItem = cart.items.find((item) => item.sku === sku);
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
      throw new AppError(CART_MESSAGES.MAX_QUANTITY_EXCEEDED, ErrorCode.BAD_REQUEST);
    }
    return updateCartItemService(userId, { sku, quantity: newQuantity });
  }

  if (cart.items.length >= CART_LIMITS.MAX_ITEMS) {
    throw new AppError(
      `Cart cannot contain more than ${CART_LIMITS.MAX_ITEMS} items`,
      ErrorCode.BAD_REQUEST
    );
  }

  const product = await findActiveProductById(productId);
  if (!product) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  validateProductStock(product, quantity);

  if (product.sku !== sku) {
    throw new AppError(CART_MESSAGES.INVALID_SKU, ErrorCode.BAD_REQUEST);
  }

  const cartItem = buildCartItem(product, quantity);
  await addItemToCart(cart.id, cartItem);

  return recalculateAndUpdateCart(cart.id);
};

export const updateCartItemService = async (
  userId: number,
  data: UpdateCartItemDto
): Promise<CartWithItems> => {
  const { sku, quantity } = data;

  const cart = await findOrCreateCartWithItems(userId);
  const existingItem = cart.items.find((item) => item.sku === sku);

  if (!existingItem) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  if (quantity === 0) {
    await removeCartItemByIds([existingItem.id]);
    return recalculateAndUpdateCart(cart.id);
  }

  const product = await findActiveProductById(existingItem.productId);
  if (!product) {
    await removeCartItemByIds([existingItem.id]);
    return recalculateAndUpdateCart(cart.id);
  }

  validateProductStock(product, quantity);

  const updatedItem = buildCartItem(product, quantity);
  await updateCartItemFull(existingItem.id, updatedItem);

  return recalculateAndUpdateCart(cart.id);
};

export const removeFromCartService = async (
  userId: number,
  sku: string
): Promise<CartWithItems> => {
  const cart = await findOrCreateCartWithItems(userId);
  const existingItem = cart.items.find((item) => item.sku === sku);

  if (!existingItem) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  await removeCartItemByIds([existingItem.id]);
  return recalculateAndUpdateCart(cart.id);
};

export const clearCartService = async (userId: number): Promise<CartWithItems> => {
  const cart = await findOrCreateCartWithItems(userId);
  return clearAndResetCart(cart.id);
};

export const syncCartService = async (
  userId: number,
  data: SyncCartDto
): Promise<CartSyncResult> => {
  const { items } = data;
  const cart = await findOrCreateCartWithItems(userId);

  if (items.length === 0) {
    const clearedCart = await clearAndResetCart(cart.id);
    return { cart: clearedCart, errors: [] };
  }

  const productIds = items.map((item) => item.productId);
  const { found: productMap } = await findProductsByIds(productIds);

  const validatedItems: ValidatedCartItem[] = [];
  const errors: Array<{ sku: string; error: string }> = [];
  const seenSkus = new Set<string>();

  for (const item of items) {
    if (seenSkus.has(item.sku)) {
      continue;
    }
    seenSkus.add(item.sku);

    const product = productMap.get(item.productId);

    if (!product) {
      errors.push({ sku: item.sku, error: CART_MESSAGES.PRODUCT_NOT_FOUND });
      continue;
    }

    if (!product.isActive) {
      errors.push({ sku: item.sku, error: CART_MESSAGES.PRODUCT_NOT_ACTIVE });
      continue;
    }

    if (product.sku !== item.sku) {
      errors.push({ sku: item.sku, error: CART_MESSAGES.INVALID_SKU });
      continue;
    }

    const syncQuantity = Math.min(item.quantity, CART_LIMITS.MAX_QUANTITY_PER_ITEM);

    if (product.stock < syncQuantity) {
      errors.push({ sku: item.sku, error: CART_MESSAGES.INSUFFICIENT_STOCK });
      continue;
    }

    validatedItems.push({
      productId: item.productId,
      sku: item.sku,
      quantity: syncQuantity,
      product,
    });
  }

  if (validatedItems.length > CART_LIMITS.MAX_ITEMS) {
    throw new AppError(
      `Cart cannot contain more than ${CART_LIMITS.MAX_ITEMS} items`,
      ErrorCode.BAD_REQUEST
    );
  }

  const cartItemsToInsert = validatedItems.map((v) => buildCartItem(v.product, v.quantity));
  const updatedCart = await syncCartItems(cart.id, cartItemsToInsert);

  return { cart: updatedCart, errors };
};
