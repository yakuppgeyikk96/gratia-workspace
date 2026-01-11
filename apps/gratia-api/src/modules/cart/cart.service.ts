import { Product } from "../../db/schema/product.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { findProductById } from "../product/product.repository";
import { CART_LIMITS, CART_MESSAGES } from "./cart.constants";
import { buildCartItem, validateProductAndStock } from "./cart.helper";
import {
  addItemToCart,
  clearCart,
  findCartWithItemsById,
  findOrCreateCartWithItems,
  removeItemFromCart,
  updateCartItem,
} from "./cart.repository";
import { CartWithItems } from "./cart.types";
import type {
  AddToCartDto,
  SyncCartDto,
  UpdateCartItemDto,
} from "./cart.validations";

export const getCartService = async (
  userId: number
): Promise<CartWithItems> => {
  const cart = await findOrCreateCartWithItems(userId);

  if (cart.items.length === 0) {
    return cart;
  }

  // Fetch all products in parallel
  const productPromises = cart.items.map((item) =>
    findProductById(item.productId).catch(() => null)
  );

  const products = await Promise.all(productPromises);

  let hasChanges = false;
  const itemsToKeep: number[] = [];
  const itemsToUpdate: Array<{ id: number; product: Product }> = [];

  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    if (!item) {
      continue;
    }

    const product = products[i];

    if (!product) {
      hasChanges = true;
      continue;
    }

    if (!product.isActive) {
      hasChanges = true;
      continue;
    }

    const priceChanged = item.price !== product.price;
    const discountedPriceChanged =
      (item.discountedPrice ? parseFloat(item.discountedPrice) : null) !==
      (product.discountedPrice ?? null);
    const nameChanged = item.productName !== product.name;
    const imagesChanged =
      JSON.stringify(item.productImages) !== JSON.stringify(product.images);

    if (
      priceChanged ||
      discountedPriceChanged ||
      nameChanged ||
      imagesChanged
    ) {
      itemsToUpdate.push({ id: item.id, product });
      hasChanges = true;
    }

    itemsToKeep.push(item.id);
  }

  // Remove items that no longer exist or are inactive
  if (hasChanges) {
    for (const item of cart.items) {
      if (!itemsToKeep.includes(item.id)) {
        // Remove item from cart
        await removeItemFromCart(userId, item.sku);
      } else {
        // Update item if needed
        const updateData = itemsToUpdate.find((u) => u.id === item.id);
        if (updateData) {
          const updatedCartItem = buildCartItem(
            updateData.product,
            item.quantity
          );
          await updateCartItem(userId, item.sku, updatedCartItem);
        }
      }
    }

    // Return updated cart
    const updatedCart = await findCartWithItemsById(cart.id);
    if (!updatedCart) {
      throw new AppError(CART_MESSAGES.CART_NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return updatedCart;
  }

  return cart;
};

export const addToCartService = async (
  userId: number,
  data: AddToCartDto
): Promise<CartWithItems> => {
  const { productId, sku, quantity } = data;

  // 1. Get or create cart
  const cart = await findOrCreateCartWithItems(userId);

  // 2. Check cart limits
  if (cart.items.length >= CART_LIMITS.MAX_ITEMS) {
    throw new AppError(
      `Cart cannot contain more than ${CART_LIMITS.MAX_ITEMS} items`,
      ErrorCode.BAD_REQUEST
    );
  }

  // 3. Handle existing item (increment quantity)
  const existingItem = cart.items.find((item) => item.sku === sku);
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
      throw new AppError(
        CART_MESSAGES.MAX_QUANTITY_EXCEEDED,
        ErrorCode.BAD_REQUEST
      );
    }
    return await updateCartItemService(userId, { sku, quantity: newQuantity });
  }

  // 4. Validate product and stock
  const product = await validateProductAndStock(productId, quantity);

  // 5. Verify SKU matches
  if (product.sku !== sku) {
    throw new AppError(CART_MESSAGES.INVALID_SKU, ErrorCode.BAD_REQUEST);
  }

  // 6. Build cart item
  const cartItem = buildCartItem(product, quantity);

  // 7. Add to cart using repository
  const updatedCart = await addItemToCart(userId, cartItem);
  if (!updatedCart) {
    throw new AppError(
      CART_MESSAGES.CART_UPDATE_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return updatedCart;
};

export const updateCartItemService = async (
  userId: number,
  data: UpdateCartItemDto
): Promise<CartWithItems> => {
  const { sku, quantity } = data;

  // 1. If quantity is 0, remove item from cart
  if (quantity === 0) {
    return await removeFromCartService(userId, sku);
  }

  // 2. Get cart to find existing item
  const cart = await findOrCreateCartWithItems(userId);
  const existingItem = cart.items.find((item) => item.sku === sku);

  if (!existingItem) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // 3. Validate product and stock availability
  const product = await validateProductAndStock(
    existingItem.productId,
    quantity
  );

  // 4. Build updated cart item with current price and product info
  const updatedCartItem = buildCartItem(product, quantity);

  // 5. Update cart item
  const updatedCart = await updateCartItem(userId, sku, updatedCartItem);
  if (!updatedCart) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return updatedCart;
};

export const removeFromCartService = async (
  userId: number,
  sku: string
): Promise<CartWithItems> => {
  const updatedCart = await removeItemFromCart(userId, sku);

  if (!updatedCart) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return updatedCart;
};

export const clearCartService = async (
  userId: number
): Promise<CartWithItems> => {
  const cart = await clearCart(userId);
  if (!cart) {
    throw new AppError(CART_MESSAGES.CART_NOT_FOUND, ErrorCode.NOT_FOUND);
  }
  return cart;
};

export const syncCartService = async (
  userId: number,
  data: SyncCartDto
): Promise<CartWithItems> => {
  const { items } = data;

  // 1. Get or create cart
  const cart = await findOrCreateCartWithItems(userId);

  // 2. Validate frontend items and create map
  const validatedItemsMap = new Map<
    string,
    {
      sku: string;
      productId: number;
      quantity: number;
      product: Product;
    }
  >();

  const errors: Array<{ sku: string; error: string }> = [];

  // 3. Validate all items from frontend
  for (const item of items) {
    try {
      // Validate productId (already number from validation)
      const productIdNumber = item.productId;

      const product = await validateProductAndStock(
        productIdNumber,
        item.quantity
      );

      if (product.sku !== item.sku) {
        errors.push({ sku: item.sku, error: CART_MESSAGES.INVALID_SKU });
        continue;
      }

      // Apply MAX_QUANTITY limit
      const syncQuantity = Math.min(
        item.quantity,
        CART_LIMITS.MAX_QUANTITY_PER_ITEM
      );

      // Re-check stock only (product already validated)
      if (product.stock < syncQuantity) {
        errors.push({
          sku: item.sku,
          error: CART_MESSAGES.INSUFFICIENT_STOCK,
        });
        continue;
      }

      validatedItemsMap.set(item.sku, {
        sku: item.sku,
        productId: productIdNumber,
        quantity: syncQuantity,
        product,
      });
    } catch (error: any) {
      errors.push({
        sku: item.sku,
        error: error.message || "Validation failed",
      });
    }
  }

  // 4. Check cart limits
  if (validatedItemsMap.size > CART_LIMITS.MAX_ITEMS) {
    throw new AppError(
      `Cart cannot contain more than ${CART_LIMITS.MAX_ITEMS} items`,
      ErrorCode.BAD_REQUEST
    );
  }

  // 5. Clear existing cart and add validated items
  await clearCart(userId);

  // 6. Add all validated items to cart
  for (const [, validatedItem] of validatedItemsMap) {
    const cartItem = buildCartItem(
      validatedItem.product,
      validatedItem.quantity
    );
    await addItemToCart(userId, cartItem);
  }

  // 7. Get updated cart
  const updatedCart = await findCartWithItemsById(cart.id);
  if (!updatedCart) {
    throw new AppError(CART_MESSAGES.CART_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // 8. Log errors if any
  if (errors.length > 0) {
    console.warn("Cart sync completed with errors:", errors);
  }

  return updatedCart;
};
