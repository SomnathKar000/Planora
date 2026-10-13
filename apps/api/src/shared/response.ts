// ────────────────────────────────────────────────────────────────
// Planora API — Response Helpers
// ────────────────────────────────────────────────────────────────

import type { Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '@planora/shared-types';

/** Send a success JSON response */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const body: ApiResponse<T> = { success: true, data };
  res.status(statusCode).json(body);
}

/** Send a paginated success JSON response */
export function sendPaginated<T>(
  res: Response,
  items: T[],
  opts: { page?: number; pageSize?: number } = {},
): void {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? items.length;
  const payload: PaginatedResponse<T> = {
    items,
    total: items.length,
    page,
    pageSize,
  };
  const body: ApiResponse<PaginatedResponse<T>> = { success: true, data: payload };
  res.status(200).json(body);
}

/** Send an error JSON response */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  const body: ApiResponse<never> = {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };
  res.status(statusCode).json(body);
}
