"use server";

import { COOKIE_TOKEN_KEY } from "@/constants";
import { cookies } from "next/headers";

export const getAuthToken = async () => {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(COOKIE_TOKEN_KEY)?.value;
  return authToken;
};

export const getAuthHeader = async (): Promise<Record<string, string>> => {
  const authToken = await getAuthToken();

  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};
