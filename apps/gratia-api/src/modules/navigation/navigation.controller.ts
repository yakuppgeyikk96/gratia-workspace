import { Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { getNavigationService } from "./navigation.service";

export const getNavigationController = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const navigation = await getNavigationService();

    returnSuccess(
      res,
      navigation,
      "Navigation retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);
