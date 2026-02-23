import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

// Factory function — pass in a Zod schema, get back a middleware
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate request body against schema
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Extract readable error messages
        const messages = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        logger.warn("Validation failed", { messages, path: req.path });

        sendError(
          res,
          messages.map((m) => `${m.field}: ${m.message}`).join(", "),
          400
        );
        return;
      }
      sendError(res, "Validation failed", 400);
    }
  };
};

// ─── Schemas for each route ───────────────────────────────────────

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

// Biometric schema
export const biometricSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format"),
  credentialId: z.string().min(1, "Credential ID is required"),
  publicKey: z.string().min(1, "Public key is required"),
  fingerprintHash: z.string().min(1, "Fingerprint hash is required"),
});

// Vote schema
export const voteSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format"),
  biometricId: z.string().uuid("Invalid biometric ID format"),
  voteChoice: z.string().min(1, "Vote choice is required"),
});