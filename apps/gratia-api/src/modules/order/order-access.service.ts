import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { deleteRedisValue, getRedisValue, sendMail, setRedisValue } from "../../shared/services";
import { generateUniqueToken, generateVerificationCode } from "../../shared/utils/token.utils";
import { findOrderByOrderNumber } from "./order.repository";

const ORDER_ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
const ORDER_ACCESS_REQUEST_TTL_SECONDS = 15 * 60; // 15 minutes

export type OrderAccessRecord = {
  orderNumber: string;
  email: string;
};

type OrderAccessRequestRecord = {
  orderNumber: string;
  email: string;
  code: string;
};

export const getOrderByNumberOrThrow = async (orderNumber: string) => {
  const order = await findOrderByOrderNumber(orderNumber);
  if (!order) {
    throw new AppError("Order not found", ErrorCode.NOT_FOUND);
  }
  return order;
};

export const validateGuestOrderAccessToken = async (
  orderNumber: string,
  token: string
): Promise<OrderAccessRecord> => {
  const record = await getRedisValue<OrderAccessRecord>(`order:access:${token}`);
  if (!record || record.orderNumber !== orderNumber) {
    throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
  }
  return record;
};

export const createGuestOrderAccessToken = async (
  orderNumber: string,
  email: string
): Promise<string> => {
  const token = generateUniqueToken();
  await setRedisValue(
    `order:access:${token}`,
    { orderNumber, email },
    ORDER_ACCESS_TOKEN_TTL_SECONDS
  );
  return token;
};

export const requestGuestOrderAccess = async (
  orderNumber: string,
  email: string
): Promise<{ requestToken: string }> => {
  const order = await getOrderByNumberOrThrow(orderNumber);

  // Privacy: don't reveal if email matches; only send if it matches.
  if (order.email.toLowerCase() !== email.toLowerCase()) {
    return { requestToken: generateUniqueToken() };
  }

  const requestToken = generateUniqueToken();
  const code = generateVerificationCode();

  await setRedisValue(
    `order:access:req:${requestToken}`,
    { orderNumber, email, code },
    ORDER_ACCESS_REQUEST_TTL_SECONDS
  );

  await sendMail({
    to: email,
    subject: "Your order access code",
    text: `Your access code is: ${code}`,
    html: `<p>Your access code is: <strong>${code}</strong></p>`,
  });

  return { requestToken };
};

export const verifyGuestOrderAccess = async (
  orderNumber: string,
  requestToken: string,
  code: string
): Promise<{ orderAccessToken: string }> => {
  const record = await getRedisValue<OrderAccessRequestRecord>(
    `order:access:req:${requestToken}`
  );

  if (
    !record ||
    record.orderNumber !== orderNumber ||
    record.code !== code
  ) {
    throw new AppError("Invalid verification code", ErrorCode.BAD_REQUEST);
  }

  const orderAccessToken = await createGuestOrderAccessToken(
    record.orderNumber,
    record.email
  );

  await deleteRedisValue(`order:access:req:${requestToken}`);

  return { orderAccessToken };
};

