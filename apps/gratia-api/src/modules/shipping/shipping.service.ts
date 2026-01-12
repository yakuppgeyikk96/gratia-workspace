import { ShippingMethod } from "../../db/schema/shipping.schema";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { Address } from "../../shared/types";
import { CartSnapshot } from "../checkout/checkout-session.types";
import { SHIPPING_MESSAGES } from "./shipping.constants";
import {
  findAvailableShippingMethodsByCountry,
  findShippingMethodByIdAndValidate,
} from "./shipping.repository";

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

    // If method has minOrderAmount and cart total meets requirement, make it free
    if (minOrderAmount && cartSnapshot.subtotal >= minOrderAmount) {
      return {
        ...method,
        price: method.price,
        isFree: true,
      };
    }

    return method;
  });

  return availableMethods;
};

export const validateShippingMethodService = async (
  shippingMethodId: number
): Promise<ShippingMethod> => {
  const method = await findShippingMethodByIdAndValidate(shippingMethodId);

  if (!method) {
    throw new AppError(
      SHIPPING_MESSAGES.SHIPPING_METHOD_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return method;
};

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
