import { Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import {
  addProductToWishlist,
  checkWishlistProductIds,
  getUserWishlist,
  getUserWishlistCount,
  removeProductFromWishlist,
} from "./wishlist.service";

export const getWishlistController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user!.userId);
    const result = await getUserWishlist(userId);

    returnSuccess(
      res,
      result,
      "Wishlist retrieved successfully",
      StatusCode.SUCCESS,
    );
  },
);

export const addToWishlistController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user!.userId);
    const { productId } = req.body as { productId: number };

    const result = await addProductToWishlist(userId, productId);

    returnSuccess(
      res,
      result,
      "Product added to wishlist",
      StatusCode.CREATED,
    );
  },
);

export const removeFromWishlistController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user!.userId);
    const { productId } = req.params as unknown as { productId: number };

    await removeProductFromWishlist(userId, productId);

    returnSuccess(
      res,
      null,
      "Product removed from wishlist",
      StatusCode.SUCCESS,
    );
  },
);

export const checkWishlistController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user!.userId);
    const { productIds } = req.query as unknown as { productIds: number[] };

    const result = await checkWishlistProductIds(userId, productIds);

    returnSuccess(
      res,
      result,
      "Wishlist check completed",
      StatusCode.SUCCESS,
    );
  },
);

export const getWishlistCountController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user!.userId);
    const result = await getUserWishlistCount(userId);

    returnSuccess(
      res,
      result,
      "Wishlist count retrieved",
      StatusCode.SUCCESS,
    );
  },
);
