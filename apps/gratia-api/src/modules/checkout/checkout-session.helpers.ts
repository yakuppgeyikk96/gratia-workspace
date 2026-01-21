import crypto from "crypto";
import type { Product } from "../../db/schema/product.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { getRedisKeyTTL, getRedisValue } from "../../shared/services";
import { CartResponse } from "../cart/cart.types";
import { findProductsBySkus } from "../product/product.repository";
import {
  CartSnapshot,
  CartSnapshotItem,
  CheckoutPricing,
  CheckoutSession,
  CheckoutStatus,
  CheckoutStep,
} from "./checkout-session.types";
import {
  CHECKOUT_CONFIG,
  CHECKOUT_MESSAGES,
  CHECKOUT_REDIS_KEYS,
} from "./checkout.constants";

export const generateSessionToken = (): string => {
  const randomBytes = crypto.randomBytes(CHECKOUT_CONFIG.SESSION_TOKEN_LENGTH);
  const randomString = randomBytes.toString("hex");
  return `${CHECKOUT_CONFIG.SESSION_TOKEN_PREFIX}${randomString}`;
};

export const getSessionRedisKey = (sessionToken: string): string => {
  return `${CHECKOUT_REDIS_KEYS.SESSION_PREFIX}${sessionToken}`;
};

export const validateSessionTokenFormat = (sessionToken: string): boolean => {
  if (!sessionToken || typeof sessionToken !== "string") {
    return false;
  }

  // Check prefix
  if (!sessionToken.startsWith(CHECKOUT_CONFIG.SESSION_TOKEN_PREFIX)) {
    return false;
  }

  // Check length (prefix + hex string)
  const expectedLength =
    CHECKOUT_CONFIG.SESSION_TOKEN_PREFIX.length +
    CHECKOUT_CONFIG.SESSION_TOKEN_LENGTH * 2; // hex is 2 chars per byte

  if (sessionToken.length !== expectedLength) {
    return false;
  }

  // Check if remainder is valid hex
  const hexPart = sessionToken.substring(
    CHECKOUT_CONFIG.SESSION_TOKEN_PREFIX.length
  );
  const hexRegex = /^[a-f0-9]+$/i;

  return hexRegex.test(hexPart);
};

export const calculateExpiresAt = (): Date => {
  const expiresAt = new Date();
  expiresAt.setSeconds(
    expiresAt.getSeconds() + CHECKOUT_CONFIG.SESSION_TTL_SECONDS
  );
  return expiresAt;
};

export const isSessionExpired = (session: CheckoutSession): boolean => {
  return new Date() > session.expiresAt;
};

export const createCartSnapshot = (cart: CartResponse): CartSnapshot => {
  return {
    items: cart.items.map(
      (item): CartSnapshotItem => ({
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
        price: parseFloat(item.price),
        discountedPrice: item.discountedPrice
          ? parseFloat(item.discountedPrice)
          : 0,
        productName: item.productName,
        productImages: item.productImages,
        attributes: item.attributes,
        isVariant: item.isVariant,
      })
    ),
    subtotal: parseFloat(cart.summary.total),
    totalItems: cart.summary.totalItems,
  };
};

/**
 * Calculates initial pricing from cart snapshot
 * @param cartSnapshot - Cart snapshot
 * @returns Initial pricing
 */
export const calculateInitialPricing = (
  cartSnapshot: CartSnapshot
): CheckoutPricing => {
  return {
    subtotal: cartSnapshot.subtotal,
    shippingCost: 0,
    discount: 0,
    tax: 0,
    total: cartSnapshot.subtotal,
  };
};

export const validateSession = (
  session: CheckoutSession | null
): asserts session is CheckoutSession => {
  if (!session) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  if (isSessionExpired(session)) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_EXPIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  if (session.status === CheckoutStatus.COMPLETED) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_ALREADY_COMPLETED,
      ErrorCode.BAD_REQUEST
    );
  }
};

export const canProceedToStep = (
  session: CheckoutSession,
  requiredStep: CheckoutStep
): boolean => {
  const stepOrder = [
    CheckoutStep.SHIPPING,
    CheckoutStep.SHIPPING_METHOD,
    CheckoutStep.PAYMENT,
    CheckoutStep.COMPLETED,
  ];

  const currentStepIndex = stepOrder.indexOf(session.currentStep);
  const requiredStepIndex = stepOrder.indexOf(requiredStep);

  return currentStepIndex >= requiredStepIndex;
};

export const validateAndBuildGuestCartSnapshot = async (
  items: { sku: string; quantity: number }[]
): Promise<CartSnapshot> => {
  const validatedItems: CartSnapshotItem[] = [];

  // Extract all SKUs and fetch products in a single query (avoid N+1)
  const skus = items.map((item) => item.sku);
  const products = await findProductsBySkus(skus);

  // Create a map for O(1) lookup
  const productMap = new Map<string, Product>(products.map((p) => [p.sku, p]));

  // Validate all items
  for (const item of items) {
    const product = productMap.get(item.sku);

    if (!product) {
      throw new AppError(
        `Product with SKU ${item.sku} not found`,
        ErrorCode.NOT_FOUND
      );
    }

    // Check if product is active
    if (!product.isActive) {
      throw new AppError(
        `Product with SKU ${item.sku} is not active`,
        ErrorCode.BAD_REQUEST
      );
    }

    // Validate stock availability
    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for product with SKU ${item.sku}`,
        ErrorCode.BAD_REQUEST
      );
    }

    // Build cart item
    const cartItem = buildCartSnapshotItem(product, item.quantity);
    // Convert to CartSnapshot item format
    validatedItems.push(cartItem);
  }

  // Calculate subtotal
  const subtotal = validatedItems.reduce((sum, item) => {
    const itemPrice = item.discountedPrice > 0 ? item.discountedPrice : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const totalItems = validatedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return {
    items: validatedItems,
    subtotal,
    totalItems,
  };
};

export const getSessionWithTTL = async (
  sessionToken: string
): Promise<CheckoutSession> => {
  const redisKey = getSessionRedisKey(sessionToken);
  const session: CheckoutSession | null =
    await getRedisValue<CheckoutSession>(redisKey);

  // Validate session manually
  if (!session) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  if (isSessionExpired(session)) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_EXPIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  if (session.status === CheckoutStatus.COMPLETED) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_ALREADY_COMPLETED,
      ErrorCode.BAD_REQUEST
    );
  }

  // Get TTL from Redis and update session
  const ttl = await getRedisKeyTTL(redisKey);

  return {
    ...session,
    ttl: ttl > 0 ? ttl : 0,
  };
};

export const updatePricingWithShipping = (
  currentPricing: CheckoutPricing,
  shippingCost: number
): CheckoutPricing => {
  return {
    ...currentPricing,
    shippingCost,
    total: currentPricing.subtotal + shippingCost - currentPricing.discount,
  };
};

export const validateCheckoutCompletion = (session: CheckoutSession): void => {
  if (!session.shippingAddress) {
    throw new AppError(
      CHECKOUT_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  if (!session.shippingMethodId) {
    throw new AppError(
      CHECKOUT_MESSAGES.SHIPPING_METHOD_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }
};

const buildCartSnapshotItem = (
  product: Product,
  quantity: number
): Omit<CartSnapshotItem, never> => {
  const isVariant =
    !!product.productGroupId &&
    product.productGroupId !== `pg_${product.id.toString()}`;

  return {
    productId: product.id,
    sku: product.sku,
    quantity,
    price: parseFloat(product.price),
    discountedPrice: product.discountedPrice
      ? parseFloat(product.discountedPrice)
      : 0,
    productName: product.name,
    productImages: (product.images as string[]) || [],
    attributes: (product.attributes || {}) as {
      color?: string;
      size?: string;
      material?: string;
    },
    isVariant,
  };
};
