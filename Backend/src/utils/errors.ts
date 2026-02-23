// Base error class — all custom errors extend this
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // operational = expected error, not a bug
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 — request is malformed or missing fields
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

// 401 — not logged in or token invalid
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

// 403 — logged in but not allowed to do this
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

// 404 — resource not found
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

// 409 — conflict, e.g. already voted, duplicate fingerprint
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// 410 — resource existed but is now gone, e.g. expired QR code
export class GoneError extends AppError {
  constructor(message: string) {
    super(message, 410);
  }
}

// 500 — unexpected server error
export class InternalError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}