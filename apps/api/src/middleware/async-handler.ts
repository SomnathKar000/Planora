// ────────────────────────────────────────────────────────────────
// Planora API — Async Route Wrapper
// ────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler so that thrown errors are forwarded
 * to the Express error-handling middleware via `next()`.
 * Eliminates the need for try/catch in every controller method.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
