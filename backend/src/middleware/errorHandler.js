// ═══════════════════════════════════════════
// Error Handler Middleware
// ═══════════════════════════════════════════

import { logger } from '../utils/logger.js';

/**
 * 404 handler — catches requests to undefined routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
    errors: null,
  });
}

/**
 * Global error handler — catches all unhandled errors.
 * Must have 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  logger.error(err);

  // Prisma known request errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with that value already exists.',
      data: null,
      errors: [err.meta?.target?.join(', ') || 'unique constraint violation'],
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
      data: null,
      errors: null,
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: err.errors || null,
  });
}
