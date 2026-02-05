import { Router } from "express";
import {
  authMiddleware,
  optionalAuthMiddleware,
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middlewares";
import {
  getOrderByOrderNumberController,
  getUserOrdersController,
  requestOrderAccessController,
  verifyOrderAccessController,
} from "./order.controller";
import {
  orderNumberParamsSchema,
  requestOrderAccessSchema,
  userOrdersQuerySchema,
  verifyOrderAccessSchema,
} from "./order.validations";

const router: Router = Router();

router.get(
  "/my-orders",
  authMiddleware,
  validateQuery(userOrdersQuerySchema),
  getUserOrdersController
);

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

