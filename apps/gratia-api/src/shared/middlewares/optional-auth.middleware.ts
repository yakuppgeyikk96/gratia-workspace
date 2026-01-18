import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";
import { verifyJwtToken } from "../utils/jwt.utils";

/**
 * Optional auth: if Authorization header exists, validate it and set req.user.
 * If header is missing, continue as guest.
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = await verifyJwtToken(token);
    req.user = decoded;
  } catch (_error) {
    // Ignore invalid tokens for public routes; treat as guest
  }

  return next();
};

