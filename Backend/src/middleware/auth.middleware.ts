import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

// Extend Express Request to include admin property
export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "No token provided", 401);
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1] as string;

    if (!token) {
      sendError(res, "Invalid token format", 401);
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
    };

    // Attach admin info to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
    };

    logger.debug("Admin authenticated", { adminId: decoded.id });

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, "Token has expired. Please login again", 401);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, "Invalid token", 401);
      return;
    }
    logger.error("Auth middleware error", { error });
    sendError(res, "Authentication failed", 401);
  }
};