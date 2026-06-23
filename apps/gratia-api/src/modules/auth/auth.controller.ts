import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { AUTH_MESSAGES } from "./auth.constants";
import {
  loginUser,
  registerUser,
  sendVerificationCodeByEmail,
} from "./auth.services";
import {
  LoginUserDto,
  RegisterUserDto,
  SendVerificationCodeByEmailDto,
} from "./auth.validations";

export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: SendVerificationCodeByEmailDto = req.body;

    const result = await sendVerificationCodeByEmail(payload);

    returnSuccess(res, result, AUTH_MESSAGES.VERIFICATION_CODE_SENT);
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: RegisterUserDto = req.body;

    const result = await registerUser(payload);

    returnSuccess(res, result, AUTH_MESSAGES.USER_REGISTERED);
  }
);

export const loginUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: LoginUserDto = req.body;

    const result = await loginUser(payload);

    returnSuccess(res, result, AUTH_MESSAGES.USER_LOGGED_IN);
  }
);

// Source of truth for client auth state. Auth middleware validates the JWT
// (signature + exp); we return the decoded payload as the current user. Client
// hooks call this on mount and on focus to detect expiry and logout from
// other devices.
export const getCurrentUserController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(
        "Not authenticated",
        ErrorCode.UNAUTHORIZED,
        StatusCode.UNAUTHORIZED,
      );
    }
    returnSuccess(
      res,
      {
        id: Number(req.user.userId),
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      },
      "Current user",
      StatusCode.SUCCESS,
    );
  },
);
