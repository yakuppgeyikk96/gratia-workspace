import { ShippingMethod } from "../../db/schema/shipping.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { Address } from "../../shared/types";
import { CartSnapshot } from "../checkout/checkout-session.types";
import { SHIPPING_MESSAGES } from "./shipping.constants";
import {
  findAvailableShippingMethodsByCountry,
  findShippingMethodByIdAndValidate,
} from "./shipping.repository";

/**
 * Gets available shipping methods for checkout session
 * Filters by country and applies free shipping rules based on cart total
 * @param shippingAddress - Shipping address
 * @param cartSnapshot - Cart snapshot with subtotal
 * @returns Array of available shipping methods with calculated prices
 */
export const getAvailableShippingMethodsService = async (
  shippingAddress: Address,
  cartSnapshot: CartSnapshot
): Promise<ShippingMethod[]> => {
  // Get shipping methods available for the country
  const methods = await findAvailableShippingMethodsByCountry(
    shippingAddress.country
  );

  // Apply free shipping rules based on cart total
  const availableMethods = methods.map((method) => {
    const minOrderAmount = method.minOrderAmount
      ? parseFloat(method.minOrderAmount)
      : null;
    const price = parseFloat(method.price);

    // If method has minOrderAmount and cart total meets requirement, make it free
    if (minOrderAmount && cartSnapshot.subtotal >= minOrderAmount) {
      return {
        ...method,
        price: "0",
        isFree: true,
      };
    }

    return method;
  });

  return availableMethods;
};

/**
 * Validates shipping method and returns it
 * @param shippingMethodId - Shipping method ID (string from API, will be parsed)
 * @returns Validated shipping method
 */
export const validateShippingMethodService = async (
  shippingMethodId: string
): Promise<ShippingMethod> => {
  // Parse ID from string to number
  const id = parseInt(shippingMethodId, 10);
  if (isNaN(id)) {
    throw new AppError(
      SHIPPING_MESSAGES.SHIPPING_METHOD_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  const method = await findShippingMethodByIdAndValidate(id);

  if (!method) {
    throw new AppError(
      SHIPPING_MESSAGES.SHIPPING_METHOD_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return method;
};

/**
 * Calculates shipping cost for a method based on cart total
 * Applies free shipping if cart total meets minOrderAmount
 * @param method - Shipping method
 * @param cartSubtotal - Cart subtotal
 * @returns Calculated shipping cost
 */
export const calculateShippingCost = (
  method: ShippingMethod,
  cartSubtotal: number
): number => {
  const minOrderAmount = method.minOrderAmount
    ? parseFloat(method.minOrderAmount)
    : null;
  const price = parseFloat(method.price);

  // Check if free shipping applies
  if (minOrderAmount && cartSubtotal >= minOrderAmount) {
    return 0;
  }

  return price;
};
