import jwt from "jsonwebtoken";
import { JwtErrorCode } from "../errors/jwt.errors";

export interface JwtPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export const generateJwtToken = (payload: JwtPayload): string => {
  try {
    // @ts-ignore - TypeScript has issues with jsonwebtoken types
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    throw new Error(JwtErrorCode.JWT_GENERATION_FAILED);
  }
};

export const verifyJwtToken = async (token: string): Promise<JwtPayload> => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return payload;
  } catch (error) {
    throw new Error(JwtErrorCode.JWT_VERIFICATION_FAILED);
  }
};
