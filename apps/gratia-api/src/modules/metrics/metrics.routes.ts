import { Router } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { clearMetrics, getMetrics } from "./metrics.controller";

const router: Router = Router();

router.get("/", asyncHandler(getMetrics));
router.post("/reset", asyncHandler(clearMetrics));

export default router;
