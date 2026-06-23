import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { getMetricsSnapshot, resetMetrics } from "../../shared/metrics";
import { StatusCode } from "../../shared/types";
import { returnSuccess } from "../../shared/utils/response.utils";

const isDevelopment = (): boolean => process.env.NODE_ENV === "development";

const requireMetricsAccess = (req: Request): void => {
  const token = process.env.METRICS_TOKEN;

  if (!token) {
    if (isDevelopment()) return;
    throw new AppError("Not found", ErrorCode.NOT_FOUND, 404);
  }

  const auth = req.headers.authorization ?? "";
  const expected = `Bearer ${token}`;
  if (auth !== expected) {
    throw new AppError("Not found", ErrorCode.NOT_FOUND, 404);
  }
};

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  requireMetricsAccess(req);
  const snapshot = getMetricsSnapshot();
  returnSuccess(res, snapshot, "Metrics snapshot", StatusCode.SUCCESS);
};

export const clearMetrics = async (req: Request, res: Response): Promise<void> => {
  requireMetricsAccess(req);
  resetMetrics();
  returnSuccess(res, null, "Metrics reset", StatusCode.SUCCESS);
};
