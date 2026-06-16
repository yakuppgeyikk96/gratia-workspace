import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../../shared/middlewares";
import { runSeed } from "./seed.controller";

const router: Router = Router();

// Hide seed endpoint entirely in production. Allows local/dev/staging use
// (where it is invaluable for demo data) without exposing it on prod.
const productionGuard = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }
  next();
};

router.post("/", productionGuard, authMiddleware, runSeed);

export default router;
