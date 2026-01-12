import { Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { getIdParam, getStringParam } from "../../shared/utils/params.utils";
import {
  getAllCountriesService,
  getCitiesByStateCodeService,
  getCitiesByStateService,
  getCountryByCodeService,
  getStatesByCountryCodeService,
  getStatesByCountryService,
} from "./location.service";

/**
 * Get all countries
 * Public endpoint
 */
export const getAllCountriesController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const countries = await getAllCountriesService();

    returnSuccess(
      res,
      countries,
      "Countries retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get country by code
 * Public endpoint
 */
export const getCountryByCodeController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const code = getStringParam(req.params.code, "country code");
    const country = await getCountryByCodeService(code);

    returnSuccess(
      res,
      country,
      "Country retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get all states for a country
 * Public endpoint
 */
export const getStatesByCountryController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const countryId = getIdParam(req.params.countryId, "country ID");
    const states = await getStatesByCountryService(countryId);

    returnSuccess(
      res,
      states,
      "States retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get all cities for a state
 * Public endpoint
 */
export const getCitiesByStateController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const stateId = getIdParam(req.params.stateId, "state ID");
    const cities = await getCitiesByStateService(stateId);

    returnSuccess(
      res,
      cities,
      "Cities retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get all states for a country by country code
 * Public endpoint
 */
export const getStatesByCountryCodeController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const code = getStringParam(req.params.code, "country code");
    const states = await getStatesByCountryCodeService(code);

    returnSuccess(
      res,
      states,
      "States retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get all cities for a state by country code and state code
 * Public endpoint
 */
export const getCitiesByStateCodeController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const countryCode = getStringParam(req.params.countryCode, "country code");
    const stateCode = getStringParam(req.params.stateCode, "state code");

    const cities = await getCitiesByStateCodeService(countryCode, stateCode);

    returnSuccess(
      res,
      cities,
      "Cities retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);
