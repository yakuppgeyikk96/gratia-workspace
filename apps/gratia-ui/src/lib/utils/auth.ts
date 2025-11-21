import { isAuthenticatedUser } from "@/actions/auth";
import { cache } from "react";

export const isAuthenticated = cache(async () => {
  return await isAuthenticatedUser();
});
