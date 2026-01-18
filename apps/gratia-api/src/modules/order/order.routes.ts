import { Router } from "express";
import { optionalAuthMiddleware, validateBody, validateParams } from "../../shared/middlewares";
import {
  getOrderByOrderNumberController,
  requestOrderAccessController,
  verifyOrderAccessController,
} from "./order.controller";
import {
  orderNumberParamsSchema,
  requestOrderAccessSchema,
  verifyOrderAccessSchema,
} from "./order.validations";

const router: Router = Router();

router.get(
  "/:orderNumber",
  optionalAuthMiddleware,
  validateParams(orderNumberParamsSchema),
  getOrderByOrderNumberController
);

router.post(
  "/:orderNumber/request-access",
  validateParams(orderNumberParamsSchema),
  validateBody(requestOrderAccessSchema),
  requestOrderAccessController
);

router.post(
  "/:orderNumber/verify-access",
  validateParams(orderNumberParamsSchema),
  validateBody(verifyOrderAccessSchema),
  verifyOrderAccessController
);

export default router;

