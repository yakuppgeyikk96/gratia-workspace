import bcrypt from "bcryptjs";
import {
  UserAlreadyExistsError,
  UserCreationFailedError,
} from "../user/user.errors";
import { createUser, findUserByEmail } from "../user/user.repository";
import { createUserSchema, type CreateUserDto } from "../user/user.validation";
import {
  EmailVerificationFailedError,
  SendingVerificationEmailError,
} from "../verification/email-verification.errors";
import {
  createEmailVerification,
  verifyEmailCode,
  sendVerificationCodeByEmail as sendVerificationCodeByEmailService,
} from "../verification/email-verification.services";
import { EMAIL_VERIFICATION_EXPIRATION_TIME } from "../../shared/constants/expiration.constants";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { StatusCode } from "../../shared/types/api.types";
import { decrypt, encrypt } from "../../shared/utils/encryption.utils";
import { generateJwtToken } from "../../shared/utils/jwt.utils";
import {
  generateUniqueToken,
  generateVerificationCode,
} from "../../shared/utils/token.utils";
import {
  type LoginUserDto,
  type LoginUserResult,
  type RegisterUserDto,
  type RegisterUserResult,
  type SendVerificationCodeByEmailResult,
} from "./auth.validations";

export const sendVerificationCodeByEmail = async (
  data: CreateUserDto
): Promise<SendVerificationCodeByEmailResult> => {
  const { email } = data;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new UserAlreadyExistsError(email);
  }

  const verificationCode = generateVerificationCode();
  const token = generateUniqueToken();
  const encryptedUserData = encrypt(JSON.stringify(data));
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_TIME);
  const isUsed = false;

  const sendingEmailResult = await sendVerificationCodeByEmailService(
    email,
    verificationCode,
    expiresAt
  );

  if (!sendingEmailResult.success) {
    throw new SendingVerificationEmailError();
  }

  await createEmailVerification({
    verificationCode,
    token,
    encryptedUserData,
    expiresAt,
    isUsed,
  });

  return { token };
};

export const registerUser = async (
  data: RegisterUserDto
): Promise<RegisterUserResult> => {
  const { token, code } = data;

  const verifiedEmailData = await verifyEmailCode(token, code);

  if (!verifiedEmailData) {
    throw new EmailVerificationFailedError();
  }

  const decryptedUserData = decrypt(verifiedEmailData.encryptedUserData);

  const userData = JSON.parse(decryptedUserData);

  const validatedUserData = createUserSchema.parse(userData);

  const user = await createUser(validatedUserData);

  if (!user) {
    throw new UserCreationFailedError();
  }

  const jwtToken = await generateJwtToken({
    userId: user.id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    token: jwtToken,
  };
};

export const loginUser = async (
  data: LoginUserDto
): Promise<LoginUserResult> => {
  const { email, password } = data;

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid credentials", ErrorCode.INVALID_CREDENTIALS, StatusCode.UNAUTHORIZED);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", ErrorCode.INVALID_CREDENTIALS, StatusCode.UNAUTHORIZED);
  }

  const jwtToken = await generateJwtToken({
    userId: user.id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    token: jwtToken,
  };
};
