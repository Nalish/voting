import { Response } from "express";
import { AppError } from "./errors";
import { logger } from "./logger";

// Shape of every success response
interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T | null;
}

// Shape of every error response
interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
}

// Send a success response
export const sendSuccess = <T>(
  res: Response,
  data: T | null,
  message: string = "Success",
  statusCode: number = 200
): Response => {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(body);
};

// Send an error response
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500
): Response => {
  const body: ErrorResponse = {
    success: false,
    message,
    statusCode,
  };
  return res.status(statusCode).json(body);
};

// Global error handler — used in server.ts as Express middleware
export const globalErrorHandler = (
  err: Error,
  req: any,
  res: Response,
  next: any
): Response => {
  // Known operational error (e.g. ConflictError, NotFoundError)
  if (err instanceof AppError) {
    logger.warn(`[${err.statusCode}] ${err.message}`, {
      path: req.path,
      method: req.method,
    });
    return sendError(res, err.message, err.statusCode);
  }

  // Unknown error — log full details, hide from client
  logger.error("Unexpected error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  return sendError(res, "Something went wrong", 500);
};