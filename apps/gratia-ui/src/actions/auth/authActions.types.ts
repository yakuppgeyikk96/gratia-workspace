import { RegisterFormData } from "@/schemas/registerSchema";
import { IApiResponse } from "@/types";
import { IUser } from "@/types/User.types";

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
