import { RegisterFormData } from "@/schemas/registerSchema";
import { IApiResponse } from "@/types";
import { IUser } from "@/types/User.types";

// Identity payload returned by GET /auth/me. Lean view of the user — no
// password, no timestamps — meant for client-side display only. Server stays
// the source of truth for any real authorization decision.
export interface IAuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export type IGetCurrentUserResponse = IApiResponse<IAuthUser>;

export type ISendVerificationEmailRequest = Omit<RegisterFormData, "terms">;

export type ISendVerificationEmailResponse = IApiResponse<{
  token: string;
}>;

export interface IRegisterUserRequest {
  token: string;
  code: string;
}

export type IRegisterUserResponse = IApiResponse<{
  user: IUser;
  token: string;
}>;

export interface ILoginUserRequest {
  email: string;
  password: string;
}

export type ILoginUserResponse = IApiResponse<{
  user: IUser;
  token: string;
}>;
