import { NextFunction, Request, Response } from "express";
import pc from "picocolors";
import {
  RequestMetrics,
  recordRequest,
  runWithMetricsContext,
} from "../metrics";

interface RequestWithTiming extends Request {
  startTime?: number;
  metricsCtx?: RequestMetrics;
}

const buildRouteKey = (req: Request): string => {
  const routePath = req.route?.path;
  if (routePath) {
    return `${req.method} ${req.baseUrl ?? ""}${routePath}`;
  }
  const url = (req.originalUrl ?? req.url).split("?")[0] ?? "unknown";
  return `${req.method} ${url}`;
};

export const requestLogger = (
  req: RequestWithTiming,
  res: Response,
  next: NextFunction
): void => {
  req.startTime = Date.now();

  runWithMetricsContext((ctx) => {
    req.metricsCtx = ctx;

    res.on("finish", () => {
      const duration = req.startTime ? Date.now() - req.startTime : 0;
      const method = req.method;
      const url = req.originalUrl || req.url;
      const statusCode = res.statusCode;
      const metrics = req.metricsCtx;

      if (metrics) {
        recordRequest({
          routeKey: buildRouteKey(req),
          durationMs: duration,
          statusCode,
          dbCalls: metrics.dbCalls,
          dbTotalMs: metrics.dbTotalMs,
          redisCalls: metrics.redisCalls,
          redisTotalMs: metrics.redisTotalMs,
        });
      }

      const methodColor = (() => {
        switch (method) {
          case "GET":
            return pc.blue;
          case "POST":
            return pc.green;
          case "PUT":
          case "PATCH":
            return pc.yellow;
          case "DELETE":
            return pc.red;
          default:
            return pc.gray;
        }
      })();

      const statusColor = (() => {
        if (statusCode >= 500) return pc.red;
        if (statusCode >= 400) return pc.yellow;
        if (statusCode >= 300) return pc.cyan;
        return pc.green;
      })();

      const durationColor = (() => {
        if (duration > 1000) return pc.red;
        if (duration > 500) return pc.yellow;
        return pc.gray;
      })();

      const methodStr = methodColor(method.padEnd(6));
      const statusStr = statusColor(`${statusCode}`.padStart(3));
      const durationStr = durationColor(`${duration}ms`.padStart(8));
      const urlStr = pc.gray(url);

      let breakdown = "";
      if (metrics && (metrics.dbCalls > 0 || metrics.redisCalls > 0)) {
        const parts: string[] = [];
        if (metrics.dbCalls > 0) {
          parts.push(
            pc.gray(`db:${metrics.dbCalls}x=${Math.round(metrics.dbTotalMs)}ms`)
          );
        }
        if (metrics.redisCalls > 0) {
          parts.push(
            pc.gray(
              `redis:${metrics.redisCalls}x=${Math.round(metrics.redisTotalMs)}ms`
            )
          );
        }
        breakdown = ` ${pc.gray("(")}${parts.join(pc.gray(", "))}${pc.gray(")")}`;
      }

      console.log(
        `${methodStr} ${statusStr} ${durationStr} ${urlStr}${breakdown}`
      );
    });

    next();
  });
};
