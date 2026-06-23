import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { validateBody } from "../../shared/middlewares/validation.middleware";
import { createUserSchema } from "../user/user.validation";
import {
  getCurrentUserController,
  loginUserController,
  registerUserController,
  verifyEmailController,
} from "./auth.controller";
import {
  loginUserSchema,
  registerUserSchema,
} from "./auth.validations";

const router: Router = Router();

router.post(
  "/verify-email",
  validateBody(createUserSchema),
  verifyEmailController
);

router.post(
  "/register",
  validateBody(registerUserSchema),
  registerUserController
);

router.post("/login", validateBody(loginUserSchema), loginUserController);

router.get("/me", authMiddleware, getCurrentUserController);

export default router;
