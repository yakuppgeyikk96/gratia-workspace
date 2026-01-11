import { Response } from "express";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import {
  getAllCountriesService,
  getCitiesByStateCodeService,
  getStatesByCountryCodeService,
} from "../location/location.service";
import { getAvailableShippingMethodsService } from "../shipping/shipping.service";
import {
  completeCheckoutService,
  createCheckoutSessionService,
  getCheckoutSessionService,
  selectShippingMethodService,
  updateShippingAddressService,
} from "./checkout-session.service";
import type {
  CompletePaymentDto,
  CreateCheckoutSessionDto,
  SelectShippingMethodDto,
  UpdateShippingAddressDto,
} from "./checkout-session.types";
import { CHECKOUT_MESSAGES } from "./checkout.constants";

/**
 * Create a new checkout session
 * Public endpoint - works for both authenticated and guest users
 */
export const createCheckoutSessionController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const payload: CreateCheckoutSessionDto = req.body;

    const result = await createCheckoutSessionService(payload.items);

    returnSuccess(
      res,
      result,
      "Checkout session created successfully",
      StatusCode.CREATED
    );
  }
);

/**
 * Get checkout session by token
 * Public endpoint - works for both authenticated and guest users
 */
export const getCheckoutSessionController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    const session = await getCheckoutSessionService(token!);

    returnSuccess(
      res,
      session,
      "Checkout session retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Update shipping address
 * Public endpoint - works for both authenticated and guest users
 */
export const updateShippingAddressController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    const payload: UpdateShippingAddressDto = req.body;

    const session = await updateShippingAddressService(
      token!,
      payload.shippingAddress,
      payload.billingAddress,
      payload.billingIsSameAsShipping
    );

    returnSuccess(
      res,
      session,
      "Shipping address updated successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Select shipping method
 * Public endpoint - works for both authenticated and guest users
 */
export const selectShippingMethodController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;
    const payload: SelectShippingMethodDto = req.body;

    const updatedSession = await selectShippingMethodService(
      token!,
      payload.shippingMethodId
    );

    returnSuccess(
      res,
      updatedSession,
      "Shipping method selected successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Complete checkout and create order
 * Public endpoint - works for both authenticated and guest users
 */
export const completeCheckoutController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;
    const payload: CompletePaymentDto = req.body;

    const createdOrder = await completeCheckoutService(
      token!,
      payload.paymentMethodType,
      payload.paymentToken || ""
    );

    returnSuccess(
      res,
      {
        orderId: createdOrder.id.toString(),
        orderNumber: createdOrder.orderNumber,
      },
      "Checkout completed successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get available shipping methods for checkout session
 * Public endpoint - works for both authenticated and guest users
 */
export const getShippingMethodsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    // Get session to access shipping address and cart snapshot
    const session = await getCheckoutSessionService(token!);

    // Validate shipping address exists
    if (!session.shippingAddress) {
      throw new AppError(
        CHECKOUT_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    // Get available shipping methods
    const methods = await getAvailableShippingMethodsService(
      session.shippingAddress,
      session.cartSnapshot
    );

    // Transform to frontend format
    const shippingMethods = methods.map((method) => ({
      _id: method.id.toString(),
      name: method.name,
      carrier: method.carrier,
      description: method.description || undefined,
      estimatedDays: method.estimatedDays,
      price: parseFloat(method.price),
      isFree: method.isFree,
      imageUrl: method.imageUrl || undefined,
    }));

    returnSuccess(
      res,
      shippingMethods,
      "Shipping methods retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

export const getShippingCountryOptionsController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const allCountries = await getAllCountriesService();

    const availableCountries = allCountries.filter(
      (country) => country.isAvailableForShipping
    );

    returnSuccess(
      res,
      availableCountries,
      "Shipping country options retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

export const getShippingStatesOptionsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { code } = req.params;

    const states = await getStatesByCountryCodeService(code!);

    const availableStates = states.filter(
      (state) => state.isAvailableForShipping
    );

    returnSuccess(
      res,
      availableStates,
      "Shipping states options retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

export const getShippingCitiesOptionsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { countryCode, stateCode } = req.params;

    const cities = await getCitiesByStateCodeService(countryCode!, stateCode!);

    returnSuccess(
      res,
      cities,
      "Shipping cities options retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);
