// ═══════════════════════════════════════════
// Validation Middleware — Zod schema enforcement
// ═══════════════════════════════════════════

import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Factory that returns middleware validating req.body against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // replace with the sanitized/coerced version
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        return sendError(res, 'Validation failed.', 400, messages);
      }
      next(error);
    }
  };
}
