import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { Country, State, City } from "../../db/schema/location.schema";
import { LOCATION_MESSAGES } from "./location.constants";
import {
  findAllCountries,
  findCitiesByStateId,
  findCityByCode,
  findCityById,
  findCountryByCode,
  findCountryById,
  findStateByCode,
  findStateById,
  findStatesByCountryId,
} from "./location.repository";

/**
 * Gets all countries
 * @returns Array of countries
 */
export const getAllCountriesService = async (): Promise<Country[]> => {
  return await findAllCountries();
};

/**
 * Gets country by code
 * @param code - Country code
 * @returns Country
 */
export const getCountryByCodeService = async (code: string): Promise<Country> => {
  const country = await findCountryByCode(code);

  if (!country) {
    throw new AppError(
      LOCATION_MESSAGES.COUNTRY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return country;
};

/**
 * Gets country by ID
 * @param id - Country ID
 * @returns Country
 */
export const getCountryByIdService = async (id: number): Promise<Country> => {
  const country = await findCountryById(id);

  if (!country) {
    throw new AppError(
      LOCATION_MESSAGES.COUNTRY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return country;
};

/**
 * Gets all states for a country
 * @param countryId - Country ID
 * @returns Array of states
 */
export const getStatesByCountryService = async (
  countryId: number
): Promise<State[]> => {
  // Validate country exists
  await getCountryByIdService(countryId);

  return await findStatesByCountryId(countryId);
};

/**
 * Gets state by code within a country
 * @param countryId - Country ID
 * @param code - State code
 * @returns State
 */
export const getStateByCodeService = async (
  countryId: number,
  code: string
): Promise<State> => {
  // Validate country exists
  await getCountryByIdService(countryId);

  const state = await findStateByCode(countryId, code);

  if (!state) {
    throw new AppError(LOCATION_MESSAGES.STATE_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return state;
};

/**
 * Gets state by ID
 * @param id - State ID
 * @returns State
 */
export const getStateByIdService = async (id: number): Promise<State> => {
  const state = await findStateById(id);

  if (!state) {
    throw new AppError(LOCATION_MESSAGES.STATE_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return state;
};

/**
 * Gets all cities for a state
 * @param stateId - State ID
 * @returns Array of cities
 */
export const getCitiesByStateService = async (
  stateId: number
): Promise<City[]> => {
  // Validate state exists
  await getStateByIdService(stateId);

  return await findCitiesByStateId(stateId);
};

/**
 * Gets city by code within a state
 * @param stateId - State ID
 * @param code - City code
 * @returns City
 */
export const getCityByCodeService = async (
  stateId: number,
  code: string
): Promise<City> => {
  // Validate state exists
  await getStateByIdService(stateId);

  const city = await findCityByCode(stateId, code);

  if (!city) {
    throw new AppError(LOCATION_MESSAGES.CITY_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return city;
};

/**
 * Gets city by ID
 * @param id - City ID
 * @returns City
 */
export const getCityByIdService = async (id: number): Promise<City> => {
  const city = await findCityById(id);

  if (!city) {
    throw new AppError(LOCATION_MESSAGES.CITY_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return city;
};

/**
 * Gets all states for a country by country code
 * @param code - Country code (e.g., "US", "TR")
 * @returns Array of states
 */
export const getStatesByCountryCodeService = async (
  code: string
): Promise<State[]> => {
  // Get country by code
  const country = await getCountryByCodeService(code);

  // Get states by country ID
  return await findStatesByCountryId(country.id);
};

/**
 * Gets all cities for a state by country code and state code
 * @param countryCode - Country code (e.g., "US", "TR")
 * @param stateCode - State code (e.g., "CA", "IST")
 * @returns Array of cities
 */
export const getCitiesByStateCodeService = async (
  countryCode: string,
  stateCode: string
): Promise<City[]> => {
  // Get country by code
  const country = await getCountryByCodeService(countryCode);

  // Get state by code within country
  const state = await getStateByCodeService(country.id, stateCode);

  // Get cities by state ID
  return await findCitiesByStateId(state.id);
};
