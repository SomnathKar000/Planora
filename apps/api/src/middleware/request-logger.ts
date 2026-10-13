// ────────────────────────────────────────────────────────────────
// Planora API — Request Logger Middleware
// ────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger that prints method, path, status, and duration.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 400 ? '⚠️' : '→';
    console.log(`${level} ${req.method} ${req.originalUrl} ${status} (${duration}ms)`);
  });

  next();
}
