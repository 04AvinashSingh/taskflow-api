// ═══════════════════════════════════════════
// Response Helpers — Consistent JSON output
// ═══════════════════════════════════════════

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {any} data
 * @param {number} statusCode
 */
export function sendSuccess(res, message, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {string[]} errors
 */
export function sendError(res, message, statusCode = 400, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  });
}
