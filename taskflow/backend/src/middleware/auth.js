// ═══════════════════════════════════════════
// Auth Middleware — JWT verification
// ═══════════════════════════════════════════

import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';

/**
 * Verify JWT from the Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user on success.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please log in again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token.', 401);
    }
    return sendError(res, 'Authentication failed.', 401);
  }
}
