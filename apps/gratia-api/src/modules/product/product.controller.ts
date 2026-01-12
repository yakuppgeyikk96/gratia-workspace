import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares";
import { StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";
import { PRODUCT_MESSAGES } from "./product.constants";
import {
  createProductService,
  getFeaturedProductsService,
  getProductByIdService,
  getProductsService,
  getProductWithVariantsService,
} from "./product.service";
import type { CreateProductDto } from "./product.validations";
import { parseProductFilters } from "./utils/filter.utils";

export const createProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: CreateProductDto = req.body;

    const result = await createProductService(payload);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCT_CREATED,
      StatusCode.CREATED
    );
  }
);

export const getProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    // After validation middleware, query params are already validated and typed
    const { categorySlug, collectionSlug, sort, page, limit, details } =
      req.query as any;

    const filters = parseProductFilters(req.query as Record<string, unknown>);

    const result = await getProductsService(
      {
        categorySlug,
        collectionSlug,
        ...(filters && { filters }),
        sort,
        page,
        limit,
      },
      details
    );

    returnSuccess(res, result, PRODUCT_MESSAGES.PRODUCTS_FOUND);
  }
);

export const getProductByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    // After validation middleware, params and query are already validated
    const { id } = req.params as any;
    const { details } = req.query as any;

    const result = await getProductByIdService(id, details);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCT_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getProductWithVariantsController = asyncHandler(
  async (req: Request, res: Response) => {
    // After validation middleware, params are already validated
    const { slug } = req.params as any;

    const result = await getProductWithVariantsService(slug);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCT_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getFeaturedProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    // After validation middleware, limit is already validated and has default value
    const { limit } = req.query as any;

    const products = await getFeaturedProductsService(limit);

    returnSuccess(res, products, PRODUCT_MESSAGES.PRODUCTS_FOUND);
  }
);
