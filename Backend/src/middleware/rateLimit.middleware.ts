import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { Request, Response } from "express";

// General rate limit — applied to all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Rate limit exceeded", { ip: req.ip, path: req.path });
    sendError(res, "Too many requests. Please try again later", 429);
  },
});

// Strict limit — for biometric and vote endpoints
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // max 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Strict rate limit exceeded", { ip: req.ip, path: req.path });
    sendError(
      res,
      "Too many attempts. Please wait 15 minutes before trying again",
      429
    );
  },
});

// Login limit — prevent brute force on admin login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Login rate limit exceeded", { ip: req.ip });
    sendError(
      res,
      "Too many login attempts. Please wait 15 minutes",
      429
    );
  },
});