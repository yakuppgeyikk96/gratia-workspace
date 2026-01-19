import { Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { getStringParam } from "../../shared/utils/params.utils";
import { returnSuccess } from "../../shared/utils/response.utils";
import {
  getAllCountriesService,
  getCitiesByStateCodeService,
  getStatesByCountryCodeService,
} from "../location/location.service";
import {
  completeCheckoutService,
  createCheckoutSessionService,
  getCheckoutSessionService,
  getShippingMethodsForSessionService,
  selectShippingMethodService,
  updateShippingAddressService,
} from "./checkout-session.service";
import type {
  CompletePaymentDto,
  CreateCheckoutSessionDto,
  SelectShippingMethodDto,
  UpdateShippingAddressDto,
} from "./checkout-session.types";

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
    const token = getStringParam(req.params.token, "token");
    const session = await getCheckoutSessionService(token);

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
    const token = getStringParam(req.params.token, "token");
    const payload: UpdateShippingAddressDto = req.body;

    const session = await updateShippingAddressService(
      token,
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
    const token = getStringParam(req.params.token, "token");
    const payload: SelectShippingMethodDto = req.body;

    const updatedSession = await selectShippingMethodService(
      token,
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
    const token = getStringParam(req.params.token, "token");
    const payload: CompletePaymentDto = req.body;

    // Extract userId from authenticated user (if present)
    const userId = req.user?.userId ? parseInt(req.user.userId, 10) : null;

    const result = await completeCheckoutService(
      token,
      payload.paymentMethodType,
      payload.paymentToken || "",
      payload.notes,
      userId
    );

    returnSuccess(
      res,
      result,
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
    const token = getStringParam(req.params.token, "token");

    // Delegate all logic to service layer
    const shippingMethods = await getShippingMethodsForSessionService(token);

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
    const code = getStringParam(req.params.code, "country code");
    const states = await getStatesByCountryCodeService(code);

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
    const countryCode = getStringParam(req.params.countryCode, "country code");
    const stateCode = getStringParam(req.params.stateCode, "state code");

    const cities = await getCitiesByStateCodeService(countryCode, stateCode);

    returnSuccess(
      res,
      cities,
      "Shipping cities options retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);
