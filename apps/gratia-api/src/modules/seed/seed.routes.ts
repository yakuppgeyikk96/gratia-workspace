import { Router } from "express";
import { runSeed } from "./seed.controller";

const router: Router = Router();

router.post("/", runSeed);

export default router;
