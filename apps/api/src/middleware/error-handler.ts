// ────────────────────────────────────────────────────────────────
// Planora API — Global Error Handler Middleware
// ────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors.js';
import { sendError } from '../shared/response.js';

/**
 * Express global error-handling middleware.
 * Catches AppError subclasses for structured responses,
 * falls back to 500 for unexpected errors.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Unexpected / unhandled error
  console.error('[UnhandledError]', err);
  sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
