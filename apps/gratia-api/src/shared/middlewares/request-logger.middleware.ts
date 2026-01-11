import { NextFunction, Request, Response } from "express";
import pc from "picocolors";

interface RequestWithTiming extends Request {
  startTime?: number;
}

export const requestLogger = (
  req: RequestWithTiming,
  res: Response,
  next: NextFunction
): void => {
  req.startTime = Date.now();

  res.on("finish", () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    const statusMessage = res.statusMessage || "";

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

    console.log(`${methodStr} ${statusStr} ${durationStr} ${urlStr}`);
  });

  next();
};
