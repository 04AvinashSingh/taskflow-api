// ═══════════════════════════════════════════
// Role Check Middleware — RBAC enforcement
// ═══════════════════════════════════════════

import { sendError } from '../utils/response.js';

/**
 * Factory that returns middleware restricting access to the given roles.
 * Must be used AFTER authenticateToken so req.user is available.
 *
 * @param  {...string} allowedRoles - e.g. 'ADMIN', 'USER'
 * @returns {import('express').RequestHandler}
 */
export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role(s): ${allowedRoles.join(', ')}.`,
        403
      );
    }

    next();
  };
}
