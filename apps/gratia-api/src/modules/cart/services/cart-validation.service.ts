import { CART_LIMITS } from "../cart.constants";
import type {
  CartItem,
  CartItemStatus,
  CartProductData,
  CartResponse,
  CartSummary,
  CartValidationResult,
  CartWarning,
  StoredCartItem,
} from "../cart.types";
import {
  findProductsBySkus,
  toCartProductData,
} from "../repositories/cart.repository";

// ============================================================================
// Cart Validation Service
// ============================================================================

/**
 * Validate stored cart items against current product state
 *
 * This function:
 * 1. Fetches current product data for all items
 * 2. Validates each item (active, in stock, price changes)
 * 3. Generates warnings for any issues
 * 4. Calculates cart summary
 */
export const validateCartItems = async (
  storedItems: StoredCartItem[]
): Promise<CartValidationResult> => {
  if (storedItems.length === 0) {
    return {
      items: [],
      warnings: [],
      summary: createEmptySummary(),
    };
  }

  // Batch fetch all products
  const skus = storedItems.map((item) => item.sku);
  const productMap = await findProductsBySkus(skus);

  const validatedItems: CartItem[] = [];
  const warnings: CartWarning[] = [];

  for (const storedItem of storedItems) {
    const product = productMap.get(storedItem.sku);

    if (!product) {
      // Product not found - mark as inactive
      validatedItems.push(
        createUnavailableItem(storedItem, "inactive", "Product not found")
      );
      warnings.push({
        type: "inactive",
        sku: storedItem.sku,
        productName: `Product ${storedItem.sku}`,
        message: "This product is no longer available",
      });
      continue;
    }

    const productData = toCartProductData(product);

    // Check if product is active
    if (!productData.isActive) {
      validatedItems.push(
        createItemFromProduct(storedItem, productData, "inactive")
      );
      warnings.push({
        type: "inactive",
        sku: storedItem.sku,
        productName: productData.name,
        message: "This product is no longer available",
      });
      continue;
    }

    // Check stock
    const status = determineItemStatus(productData, storedItem.quantity, storedItem.originalPrice);
    const item = createItemFromProduct(storedItem, productData, status);
    validatedItems.push(item);

    // Generate warnings
    const itemWarnings = generateItemWarnings(storedItem, productData, status);
    warnings.push(...itemWarnings);
  }

  // Calculate summary
  const summary = calculateSummary(validatedItems);

  return {
    items: validatedItems,
    warnings,
    summary,
  };
};

/**
 * Validate a single item for add/update operations
 */
export const validateSingleItem = async (
  sku: string,
  quantity: number
): Promise<{ product: CartProductData; warnings: CartWarning[] } | null> => {
  const productMap = await findProductsBySkus([sku]);
  const product = productMap.get(sku);

  if (!product) {
    return null;
  }

  const productData = toCartProductData(product);

  if (!productData.isActive) {
    return null;
  }

  const warnings: CartWarning[] = [];

  // Check stock
  if (productData.stock === 0) {
    warnings.push({
      type: "out_of_stock",
      sku,
      productName: productData.name,
      message: "This product is out of stock",
    });
  } else if (productData.stock < quantity) {
    warnings.push({
      type: "low_stock",
      sku,
      productName: productData.name,
      message: `Only ${productData.stock} available`,
      newValue: String(productData.stock),
    });
  } else if (productData.stock <= CART_LIMITS.LOW_STOCK_THRESHOLD) {
    warnings.push({
      type: "low_stock",
      sku,
      productName: productData.name,
      message: `Only ${productData.stock} left in stock`,
      newValue: String(productData.stock),
    });
  }

  return { product: productData, warnings };
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine item status based on product data
 */
const determineItemStatus = (
  product: CartProductData,
  requestedQuantity: number,
  originalPrice: string
): CartItemStatus => {
  if (!product.isActive) {
    return "inactive";
  }

  if (product.stock === 0) {
    return "out_of_stock";
  }

  if (product.stock < requestedQuantity) {
    return "low_stock";
  }

  if (product.stock <= CART_LIMITS.LOW_STOCK_THRESHOLD) {
    return "low_stock";
  }

  const currentPrice = product.discountedPrice || product.price;
  if (currentPrice !== originalPrice) {
    return "price_changed";
  }

  return "available";
};

/**
  * Create CartItem from stored item and product data
 */
const createItemFromProduct = (
  storedItem: StoredCartItem,
  product: CartProductData,
  status: CartItemStatus
): CartItem => {
  return {
    sku: storedItem.sku,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    productImages: product.images,
    quantity: storedItem.quantity,
    price: product.price,
    originalPrice: storedItem.originalPrice,
    discountedPrice: product.discountedPrice,
    attributes: product.attributes,
    isVariant: product.isVariant,
    status,
    stockAvailable: product.stock,
    addedAt: storedItem.addedAt,
    updatedAt: storedItem.updatedAt,
  };
};

/**
 * Create unavailable item placeholder
 */
const createUnavailableItem = (
  storedItem: StoredCartItem,
  status: CartItemStatus,
  reason: string
): CartItem => {
  return {
    sku: storedItem.sku,
    productId: storedItem.productId,
    productName: `Unavailable (${reason})`,
    productSlug: "",
    productImages: [],
    quantity: storedItem.quantity,
    price: storedItem.originalPrice,
    originalPrice: storedItem.originalPrice,
    discountedPrice: null,
    attributes: {},
    isVariant: false,
    status,
    stockAvailable: 0,
    addedAt: storedItem.addedAt,
    updatedAt: storedItem.updatedAt,
  };
};

/**
 * Generate warnings for an item
 */
const generateItemWarnings = (
  storedItem: StoredCartItem,
  product: CartProductData,
  status: CartItemStatus
): CartWarning[] => {
  const warnings: CartWarning[] = [];

  // Price change warning
  const currentPrice = product.discountedPrice || product.price;
  const originalPrice = storedItem.originalPrice;

  if (currentPrice !== originalPrice) {
    const current = parseFloat(currentPrice);
    const original = parseFloat(originalPrice);

    warnings.push({
      type: current > original ? "price_increased" : "price_decreased",
      sku: storedItem.sku,
      productName: product.name,
      message:
        current > original
          ? `Price increased from ${originalPrice} to ${currentPrice}`
          : `Price decreased from ${originalPrice} to ${currentPrice}`,
      oldValue: originalPrice,
      newValue: currentPrice,
    });
  }

  // Stock warnings
  if (status === "out_of_stock") {
    warnings.push({
      type: "out_of_stock",
      sku: storedItem.sku,
      productName: product.name,
      message: "This product is out of stock",
    });
  } else if (status === "low_stock") {
    if (product.stock < storedItem.quantity) {
      warnings.push({
        type: "low_stock",
        sku: storedItem.sku,
        productName: product.name,
        message: `Only ${product.stock} available, but ${storedItem.quantity} in cart`,
        newValue: String(product.stock),
      });
    } else {
      warnings.push({
        type: "low_stock",
        sku: storedItem.sku,
        productName: product.name,
        message: `Only ${product.stock} left in stock`,
        newValue: String(product.stock),
      });
    }
  }

  return warnings;
};

/**
 * Calculate cart summary from validated items
 */
const calculateSummary = (items: CartItem[]): CartSummary => {
  let totalItems = 0;
  let uniqueItems = 0;
  let subtotal = 0;
  let total = 0;
  let unavailableCount = 0;

  for (const item of items) {
    uniqueItems++;
    totalItems += item.quantity;

    // Only count available items in totals
    if (item.status === "available" || item.status === "low_stock" || item.status === "price_changed") {
      const originalPrice = parseFloat(item.originalPrice);
      const currentPrice = item.discountedPrice
        ? parseFloat(item.discountedPrice)
        : parseFloat(item.price);

      subtotal += originalPrice * item.quantity;
      total += currentPrice * item.quantity;
    } else {
      unavailableCount++;
    }
  }

  const discount = subtotal - total;

  return {
    totalItems,
    uniqueItems,
    subtotal: subtotal.toFixed(2),
    discount: discount.toFixed(2),
    total: total.toFixed(2),
    unavailableCount,
  };
};

/**
 * Create empty summary
 */
const createEmptySummary = (): CartSummary => {
  return {
    totalItems: 0,
    uniqueItems: 0,
    subtotal: "0.00",
    discount: "0.00",
    total: "0.00",
    unavailableCount: 0,
  };
};

/**
 * Build full CartResponse from validation result
 */
export const buildCartResponse = (
  cartId: string,
  validationResult: CartValidationResult,
  createdAt: string,
  updatedAt: string
): CartResponse => {
  return {
    id: cartId,
    items: validationResult.items,
    summary: validationResult.summary,
    warnings: validationResult.warnings,
    createdAt,
    updatedAt,
  };
};
