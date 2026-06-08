// ═══════════════════════════════════════════
// Admin Controller — User management
// ═══════════════════════════════════════════

import prisma from '../../config/db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { logger } from '../../utils/logger.js';

/**
 * GET /api/v1/admin/users
 * List all users (admin only). Never returns passwords.
 */
export async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Users retrieved successfully.', { users });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/admin/users/:id
 * Delete a user and all their tasks (admin only).
 */
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return sendError(res, 'You cannot delete your own account.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    // Cascade delete is handled by Prisma schema (onDelete: Cascade)
    await prisma.user.delete({ where: { id } });

    logger.info(`User deleted: ${id} by admin ${req.user.id}`);

    return sendSuccess(res, 'User deleted successfully.');
  } catch (error) {
    next(error);
  }
}
