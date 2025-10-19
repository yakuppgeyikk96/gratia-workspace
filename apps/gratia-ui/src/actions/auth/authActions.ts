"use server";

import { apiClient } from "@/lib/apiClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ILoginUserRequest,
  ILoginUserResponse,
  IRegisterUserRequest,
  IRegisterUserResponse,
  ISendVerificationEmailRequest,
  ISendVerificationEmailResponse,
} from "./authActions.types";

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

    cookieStore.set("gratia-token", token);
    cookieStore.set("gratia-user", JSON.stringify(user));

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

    cookieStore.set("gratia-token", token);
    cookieStore.set("gratia-user", JSON.stringify(user));

    redirect("/");
  }

  return response;
}
