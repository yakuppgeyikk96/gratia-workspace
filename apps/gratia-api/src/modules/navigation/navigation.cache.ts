import { createCache } from "../../shared/services";
import { NavigationResponse } from "./navigation.types";

export const navigationCache = createCache<NavigationResponse>(
  "navigation",
  3600,
);
