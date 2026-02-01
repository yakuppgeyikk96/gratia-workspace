import { Order } from "../../db/schema/order.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import {
  createPaymentIntent,
  deleteRedisValue,
  getRedisValue,
  setRedisValue,
} from "../../shared/services";
import { generateUniqueToken } from "../../shared/utils/token.utils";
import { generateOrderNumber } from "../order/order.helpers";
import { updateOrderPaymentIntentId } from "../order/order.repository";
import { createOrderFromSession } from "../order/order.service";
import {
  reserveStockForCheckout,
  releaseStockReservation,
  commitStockReservation,
  checkStockAvailability,
  getReservationStatus,
} from "../cart";
import {
  calculateShippingCost,
  getAvailableShippingMethodsService,
  validateShippingMethodService,
} from "../shipping/shipping.service";
import {
  calculateExpiresAt,
  calculateInitialPricing,
  generateSessionToken,
  getSessionRedisKey,
  getSessionWithTTL,
  updatePricingWithShipping,
  validateAndBuildGuestCartSnapshot,
  validateCheckoutCompletion,
} from "./checkout-session.helpers";
import {
  CheckoutSession,
  CheckoutStatus,
  CheckoutStep,
  CreateCheckoutSessionResponse,
  CreateOrderResponse,
  PaymentMethodType,
  type ShippingMethodDto,
} from "./checkout-session.types";
import { CHECKOUT_CONFIG, CHECKOUT_MESSAGES } from "./checkout.constants";

export const createCheckoutSessionService = async (
  items: { sku: string; quantity: number }[]
): Promise<CreateCheckoutSessionResponse> => {
  // Validate items
  if (!items || items.length === 0) {
    throw new AppError(CHECKOUT_MESSAGES.CART_EMPTY, ErrorCode.BAD_REQUEST);
  }

  // Generate session token
  const sessionToken = generateSessionToken();
  const expiresAt = calculateExpiresAt();

  // Create cart snapshot from items
  const cartSnapshot = await validateAndBuildGuestCartSnapshot(items);

  // Calculate initial pricing
  const pricing = calculateInitialPricing(cartSnapshot);

  // Generate session token first so we can use it for stock reservation
  // Reserve stock in Redis (locks stock for other checkout sessions)
  const stockItems = items.map((item) => ({
    sku: item.sku,
    quantity: item.quantity,
  }));
  await reserveStockForCheckout(sessionToken, stockItems);

  // Create checkout session
  const session: CheckoutSession = {
    sessionToken,
    currentStep: CheckoutStep.SHIPPING,
    status: CheckoutStatus.ACTIVE,
    shippingAddress: null,
    billingAddress: null,
    shippingMethodId: null,
    paymentMethodType: null,
    cartSnapshot,
    pricing,
    expiresAt,
    completedAt: null,
    orderNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ttl: CHECKOUT_CONFIG.SESSION_TTL_SECONDS,
  };

  // Save to Redis with TTL
  const redisKey = getSessionRedisKey(sessionToken);
  await setRedisValue(redisKey, session, CHECKOUT_CONFIG.SESSION_TTL_SECONDS);

  return {
    sessionToken,
    expiresAt,
  };
};

export const getCheckoutSessionService = async (
  sessionToken: string
): Promise<CheckoutSession> => {
  return await getSessionWithTTL(sessionToken);
};

export const updateCheckoutSessionService = async (
  sessionToken: string,
  updates: Partial<CheckoutSession>
): Promise<CheckoutSession> => {
  // Get existing session
  const session = await getSessionWithTTL(sessionToken);

  // Merge updates
  const updatedSession: CheckoutSession = {
    ...session,
    ...updates,
    updatedAt: new Date(),
    // Prevent overwriting critical fields
    sessionToken: session.sessionToken,
    createdAt: session.createdAt,
  };

  // Save updated session to Redis
  const redisKey = getSessionRedisKey(sessionToken);
  await setRedisValue(
    redisKey,
    updatedSession,
    CHECKOUT_CONFIG.SESSION_TTL_SECONDS
  );

  // Return session with fresh TTL (avoid extra Redis read)
  return {
    ...updatedSession,
    ttl: CHECKOUT_CONFIG.SESSION_TTL_SECONDS,
  };
};

/**
 * Deletes checkout session
 * @param sessionToken - Session token
 */
export const deleteCheckoutSessionService = async (
  sessionToken: string
): Promise<void> => {
  const redisKey = getSessionRedisKey(sessionToken);
  await deleteRedisValue(redisKey);
};

/**
 * Updates shipping address in checkout session
 * @param sessionToken - Session token
 * @param shippingAddress - Shipping address
 * @param billingAddress - Billing address (optional)
 * @param billingIsSameAsShipping - Whether billing address is same as shipping
 * @returns Updated session
 */
export const updateShippingAddressService = async (
  sessionToken: string,
  shippingAddress: any,
  billingAddress?: any,
  billingIsSameAsShipping: boolean = false
): Promise<CheckoutSession> => {
  const updates: Partial<CheckoutSession> = {
    shippingAddress,
    billingAddress: billingIsSameAsShipping ? shippingAddress : billingAddress,
    currentStep: CheckoutStep.SHIPPING_METHOD,
  };

  return await updateCheckoutSessionService(sessionToken, updates);
};

/**
 * Selects shipping method and updates pricing
 * @param sessionToken - Session token
 * @param shippingMethodId - Shipping method ID
 * @param shippingCost - Shipping cost
 * @returns Updated session
 */
/**
 * Gets available shipping methods for checkout session
 * Includes validation and transformation to frontend format
 * @param sessionToken - Session token
 * @returns Array of shipping methods in DTO format
 */
export const getShippingMethodsForSessionService = async (
  sessionToken: string
): Promise<ShippingMethodDto[]> => {
  // Get session to access shipping address and cart snapshot
  const session = await getSessionWithTTL(sessionToken);

  // Validate shipping address exists
  if (!session.shippingAddress) {
    throw new AppError(
      CHECKOUT_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  // Get available shipping methods (with free shipping rules applied)
  const methods = await getAvailableShippingMethodsService(
    session.shippingAddress,
    session.cartSnapshot
  );

  // Transform to frontend DTO format (remove database-specific fields)
  return methods.map((method): ShippingMethodDto => {
    const dto: ShippingMethodDto = {
      id: method.id,
      name: method.name,
      carrier: method.carrier,
      estimatedDays: method.estimatedDays,
      price: parseFloat(method.price),
      isFree: method.isFree,
    };

    // Add optional fields only if they exist
    if (method.description) {
      dto.description = method.description;
    }
    if (method.imageUrl) {
      dto.imageUrl = method.imageUrl;
    }

    return dto;
  });
};

export const selectShippingMethodService = async (
  sessionToken: string,
  shippingMethodId: number
): Promise<CheckoutSession> => {
  const session = await getSessionWithTTL(sessionToken);

  // Validate shipping address exists
  if (!session.shippingAddress) {
    throw new AppError(
      CHECKOUT_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  // Convert number to string for Redis storage and validate
  const method = await validateShippingMethodService(shippingMethodId);

  // Calculate shipping cost (applies free shipping rules)
  const shippingCost = calculateShippingCost(
    method,
    session.cartSnapshot.subtotal
  );

  // Update pricing with shipping cost
  const updatedPricing = updatePricingWithShipping(
    session.pricing,
    shippingCost
  );

  const updates: Partial<CheckoutSession> = {
    shippingMethodId,
    pricing: updatedPricing,
    currentStep: CheckoutStep.PAYMENT,
  };

  return await updateCheckoutSessionService(sessionToken, updates);
};

export const completeCheckoutService = async (
  sessionToken: string,
  paymentMethodType: PaymentMethodType,
  paymentToken: string,
  notes?: string,
  userId?: number | null
): Promise<CreateOrderResponse> => {
  // Idempotency: if this session was completed recently, return the same response
  const completionCacheKey = `checkout:complete:${sessionToken}`;
  const cached = await getRedisValue<CreateOrderResponse>(completionCacheKey);
  if (cached) {
    return cached;
  }

  /* Generate order number to be used for the order follow-up */
  const orderNumber = generateOrderNumber();

  /* Get the session from the database */
  const session = await getCheckoutSessionService(sessionToken);

  /* Validate if session is valid */
  validateCheckoutCompletion(session);

  if (paymentMethodType === PaymentMethodType.BANK_TRANSFER) {
    throw new AppError(
      CHECKOUT_MESSAGES.BANK_TRANSFER_NOT_SUPPORTED,
      ErrorCode.BAD_REQUEST
    );
  } else if (paymentMethodType === PaymentMethodType.CASH_ON_DELIVERY) {
    throw new AppError(
      CHECKOUT_MESSAGES.CASH_ON_DELIVERY_NOT_SUPPORTED,
      ErrorCode.BAD_REQUEST
    );
  }

  // Re-validate stock and ensure reservation is still active
  // Stock lock TTL (15min) may have expired before session TTL (20min)
  const stockItems = session.cartSnapshot.items.map((item) => ({
    sku: item.sku,
    quantity: item.quantity,
  }));

  const reservationStatus = await getReservationStatus(sessionToken);
  if (reservationStatus.length === 0) {
    // Locks expired - re-reserve stock before proceeding
    await reserveStockForCheckout(sessionToken, stockItems);
  } else {
    // Locks exist - verify stock is still sufficient
    const availability = await checkStockAvailability(stockItems);
    if (!availability.available) {
      const failedSkus = availability.failures.map((f) => f.sku).join(", ");
      throw new AppError(
        `Insufficient stock for: ${failedSkus}`,
        ErrorCode.CONFLICT
      );
    }
  }

  const completedSession: CheckoutSession = {
    ...session,
    paymentMethodType,
    orderNumber,
    status: CheckoutStatus.COMPLETED,
    currentStep: CheckoutStep.COMPLETED,
    completedAt: new Date(),
  };

  /**
   * Create order FIRST (paymentStatus starts as PENDING; webhook will update)
   */
  const order: Order = await createOrderFromSession(completedSession, {
    userId: userId ?? null,
    notes: notes || null,
  });

  if (!order) {
    throw new AppError(
      CHECKOUT_MESSAGES.ORDER_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  // Create payment intent (DO NOT confirm on backend; confirmation happens client-side)
  if (paymentMethodType === PaymentMethodType.CREDIT_CARD) {
    if (!paymentToken) {
      throw new AppError(
        CHECKOUT_MESSAGES.PAYMENT_TOKEN_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }
  }

  const paymentIntent = await createPaymentIntent(
    session.pricing.total,
    "usd",
    {
      sessionToken: session.sessionToken,
      orderNumber: order.orderNumber,
      orderId: order.id.toString(),
    },
    `checkout:complete:${sessionToken}`
  );

  const clientSecret = paymentIntent.client_secret;
  if (!clientSecret) {
    throw new AppError(
      "Stripe did not return a client_secret for payment intent",
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  // Persist payment intent id on the order
  await updateOrderPaymentIntentId(order.id, paymentIntent.id);

  // Issue short-lived guest order access token
  const orderAccessToken = generateUniqueToken();
  await setRedisValue(
    `order:access:${orderAccessToken}`,
    { orderNumber: order.orderNumber, email: order.email },
    60 * 60
  );

  const response: CreateOrderResponse = {
    orderId: order.id.toString(),
    orderNumber: order.orderNumber,
    paymentIntentClientSecret: clientSecret,
    orderAccessToken,
  };

  // Cache response for a short time to prevent duplicate orders on retries
  await setRedisValue(completionCacheKey, response, 60 * 60);

  /* Remove session from Redis after order is created */
  await deleteCheckoutSessionService(sessionToken);

  return response;
};
