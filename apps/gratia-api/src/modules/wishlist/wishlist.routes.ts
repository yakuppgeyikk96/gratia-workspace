import { Router } from "express";
import {
  authMiddleware,
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middlewares";
import {
  addToWishlistController,
  checkWishlistController,
  getWishlistController,
  getWishlistCountController,
  removeFromWishlistController,
} from "./wishlist.controller";
import {
  addToWishlistSchema,
  checkWishlistQuerySchema,
  productIdParamsSchema,
} from "./wishlist.validations";

const router: Router = Router();

router.use(authMiddleware);

router.get("/", getWishlistController);

router.get("/count", getWishlistCountController);

router.get(
  "/check",
  validateQuery(checkWishlistQuerySchema),
  checkWishlistController,
);

router.post("/", validateBody(addToWishlistSchema), addToWishlistController);

router.delete(
  "/:productId",
  validateParams(productIdParamsSchema),
  removeFromWishlistController,
);

export default router;
