import { Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { getStringParam } from "../../shared/utils/params.utils";
import { returnSuccess } from "../../shared/utils/response.utils";
import { getOrderByNumberOrThrow, requestGuestOrderAccess, validateGuestOrderAccessToken, verifyGuestOrderAccess } from "./order-access.service";

export const getOrderByOrderNumberController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orderNumber = getStringParam(req.params.orderNumber, "orderNumber");

    const order = await getOrderByNumberOrThrow(orderNumber);

    // Authenticated path
    if (req.user) {
      const userId = Number(req.user.userId);
      if (!Number.isFinite(userId) || order.userId !== userId) {
        // Avoid leaking existence
        returnSuccess(res, null, "Order not found", StatusCode.SUCCESS);
        return;
      }

      returnSuccess(res, order, "Order retrieved successfully", StatusCode.SUCCESS);
      return;
    }

    // Guest path: require access token in header
    const accessToken = req.headers["x-order-access-token"];
    const token =
      typeof accessToken === "string" ? accessToken : accessToken?.[0];

    if (!token) {
      returnSuccess(res, null, "Unauthorized", StatusCode.SUCCESS);
      return;
    }

    await validateGuestOrderAccessToken(orderNumber, token);
    returnSuccess(res, order, "Order retrieved successfully", StatusCode.SUCCESS);
  }
);

export const requestOrderAccessController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orderNumber = getStringParam(req.params.orderNumber, "orderNumber");
    const email = (req.body?.email as string) || "";

    const result = await requestGuestOrderAccess(orderNumber, email);

    returnSuccess(
      res,
      result,
      "If the email matches this order, an access code has been sent.",
      StatusCode.SUCCESS
    );
  }
);

export const verifyOrderAccessController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const orderNumber = getStringParam(req.params.orderNumber, "orderNumber");
    const requestToken = (req.body?.requestToken as string) || "";
    const code = (req.body?.code as string) || "";

    const result = await verifyGuestOrderAccess(orderNumber, requestToken, code);

    returnSuccess(res, result, "Access verified", StatusCode.SUCCESS);
  }
);

