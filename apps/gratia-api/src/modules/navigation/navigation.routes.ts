import { Router } from "express";
import { getNavigationController } from "./navigation.controller";

const router: Router = Router();

// GET /api/navigation - Get navigation data
router.get("/", getNavigationController);

export default router;
