"use server";

import { apiClient } from "@/lib/apiClient";
import { COOKIE_TOKEN_KEY, COOKIE_USER_KEY } from "@/constants";
import {
  IAuthUser,
  IGetCurrentUserResponse,
  ILoginUserRequest,
  ILoginUserResponse,
  IRegisterUserRequest,
  IRegisterUserResponse,
  ISendVerificationEmailRequest,
  ISendVerificationEmailResponse,
} from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_ROUTE = "/auth";

export async function sendVerificationEmail(
  request: ISendVerificationEmailRequest
): Promise<ISendVerificationEmailResponse> {
  const response: ISendVerificationEmailResponse = await apiClient.post(
    `${API_BASE_ROUTE}/verify-email`,
    request
  );

  console.log("*************** sendVerificationEmail response ***************");
  console.log(response);

  if (response.success && response.data?.token) {
    const { token } = response.data;
    redirect(`/verify-email?key=${token}`);
  }

  return response;
}

export async function registerUser(
  request: IRegisterUserRequest
): Promise<IRegisterUserResponse> {
  const response: IRegisterUserResponse = await apiClient.post(
    `${API_BASE_ROUTE}/register`,
    request
  );

  if (response.success && response.data?.user && response.data?.token) {
    const { user, token } = response.data;

    const cookieStore = await cookies();

    cookieStore.set(COOKIE_TOKEN_KEY, token);
    cookieStore.set(COOKIE_USER_KEY, JSON.stringify(user));

    redirect(`/`);
  }

  return response;
}

export async function loginUser(
  request: ILoginUserRequest
): Promise<ILoginUserResponse> {
  const response: ILoginUserResponse = await apiClient.post(
    `${API_BASE_ROUTE}/login`,
    request
  );

  if (response.success && response.data?.user && response.data?.token) {
    const { user, token } = response.data;

    const cookieStore = await cookies();

    cookieStore.set(COOKIE_TOKEN_KEY, token);
    cookieStore.set(COOKIE_USER_KEY, JSON.stringify(user));

    redirect("/");
  }

  return response;
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_TOKEN_KEY);
  cookieStore.delete(COOKIE_USER_KEY);
  redirect("/");
}

export async function isAuthenticatedUser(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN_KEY)?.value;

  return !!token;
}

// Server-authoritative auth state lookup. Reads the HttpOnly token from
// cookies (allowed in a server action without forcing the page tree to be
// dynamic) and asks the API to validate signature + expiry. The client
// useAuthQuery hook caches the result and revalidates on focus/navigation.
export async function getCurrentUser(): Promise<IGetCurrentUserResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN_KEY)?.value;

  if (!token) {
    return {
      success: false,
      message: "Not authenticated",
      errorCode: "UNAUTHORIZED",
      timestamp: new Date().toISOString(),
    };
  }

  return await apiClient.get<IAuthUser>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
