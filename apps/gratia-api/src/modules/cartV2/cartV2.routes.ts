import { Router } from "express";
import {
  validateBody,
  validateParams,
} from "../../shared/middlewares/validation.middleware";
import {
  addToCartController,
  clearCartController,
  getCartController,
  removeFromCartController,
  syncCartController,
  updateCartItemController,
} from "./cartV2.controller";
import {
  addToCartSchema,
  removeFromCartParamsSchema,
  syncCartSchema,
  updateCartItemSchema,
} from "./cartV2.validations";

const router: Router = Router();

router.get("/", getCartController);

router.post("/", validateBody(addToCartSchema), addToCartController);

router.post("/sync", validateBody(syncCartSchema), syncCartController);

router.put("/", validateBody(updateCartItemSchema), updateCartItemController);

router.delete("/", clearCartController);

router.delete(
  "/:sku",
  validateParams(removeFromCartParamsSchema),
  removeFromCartController
);

export default router;
