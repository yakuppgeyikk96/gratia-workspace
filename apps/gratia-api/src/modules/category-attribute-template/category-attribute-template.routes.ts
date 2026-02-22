import { Router } from "express";
import { getCategoryAttributeTemplateController } from "./category-attribute-template.controller";

const router: Router = Router();

// GET /api/category-attribute-templates/:categoryId
router.get("/:categoryId", getCategoryAttributeTemplateController);

export default router;
