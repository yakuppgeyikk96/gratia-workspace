import type { Request, Response } from "express";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { asyncHandler } from "../../shared/middlewares";
import { StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { getCategoryAttributeTemplate } from "./category-attribute-template.repository";

/**
 * GET /api/category-attribute-templates/:categoryId
 *
 * Get attribute template for a category. Public endpoint.
 */
export const getCategoryAttributeTemplateController = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = Number(req.params.categoryId);

    if (isNaN(categoryId) || categoryId <= 0) {
      throw new AppError(
        "Category ID must be a positive integer",
        ErrorCode.BAD_REQUEST,
        StatusCode.BAD_REQUEST,
      );
    }

    const template = await getCategoryAttributeTemplate(categoryId);

    returnSuccess(
      res,
      template,
      "Category attribute template retrieved successfully",
      StatusCode.SUCCESS,
    );
  },
);
