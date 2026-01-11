import { and, eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type Country,
  countries,
  type State,
  states,
  type City,
  cities,
} from "../../db/schema/location.schema";

/**
 * Country Repository
 */
export const findAllCountries = async (): Promise<Country[]> => {
  return await db.select().from(countries).orderBy(countries.name);
};

export const findCountryByCode = async (
  code: string
): Promise<Country | null> => {
  const [country] = await db
    .select()
    .from(countries)
    .where(eq(countries.code, code.toUpperCase()))
    .limit(1);

  return country || null;
};

export const findCountryById = async (
  id: number
): Promise<Country | null> => {
  const [country] = await db
    .select()
    .from(countries)
    .where(eq(countries.id, id))
    .limit(1);

  return country || null;
};

/**
 * State Repository
 */
export const findStatesByCountryId = async (
  countryId: number
): Promise<State[]> => {
  return await db
    .select()
    .from(states)
    .where(eq(states.countryId, countryId))
    .orderBy(states.name);
};

export const findStateByCode = async (
  countryId: number,
  code: string
): Promise<State | null> => {
  const [state] = await db
    .select()
    .from(states)
    .where(
      and(eq(states.countryId, countryId), eq(states.code, code.toUpperCase()))
    )
    .limit(1);

  return state || null;
};

export const findStateById = async (id: number): Promise<State | null> => {
  const [state] = await db
    .select()
    .from(states)
    .where(eq(states.id, id))
    .limit(1);

  return state || null;
};

/**
 * City Repository
 */
export const findCitiesByStateId = async (
  stateId: number
): Promise<City[]> => {
  return await db
    .select()
    .from(cities)
    .where(eq(cities.stateId, stateId))
    .orderBy(cities.name);
};

export const findCityByCode = async (
  stateId: number,
  code: string
): Promise<City | null> => {
  const [city] = await db
    .select()
    .from(cities)
    .where(and(eq(cities.stateId, stateId), eq(cities.code, code.trim())))
    .limit(1);

  return city || null;
};

export const findCityById = async (id: number): Promise<City | null> => {
  const [city] = await db
    .select()
    .from(cities)
    .where(eq(cities.id, id))
    .limit(1);

  return city || null;
};
