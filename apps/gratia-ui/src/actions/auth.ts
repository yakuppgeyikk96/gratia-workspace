"use server";

import { apiClient } from "@/lib/apiClient";
import { COOKIE_TOKEN_KEY, COOKIE_USER_KEY } from "@/constants";
import {
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
