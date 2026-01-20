import {
  deleteRedisValue,
  setRedisValue,
  getRedisValue,
} from "../../shared/services";
import { NavigationResponse } from "./navigation.types";

const NAVIGATION_CACHE_KEY = "navigation:data";
const NAVIGATION_CACHE_TTL = 3600; // 1 hour

export const setNavigationCache = async (
  data: NavigationResponse,
): Promise<void> => {
  await setRedisValue(NAVIGATION_CACHE_KEY, data, NAVIGATION_CACHE_TTL);
};

export const getNavigationCache =
  async (): Promise<NavigationResponse | null> => {
    const cached =
      await getRedisValue<NavigationResponse>(NAVIGATION_CACHE_KEY);
    return cached;
  };

export const clearNavigationCache = async (): Promise<void> => {
  await deleteRedisValue(NAVIGATION_CACHE_KEY);
};
