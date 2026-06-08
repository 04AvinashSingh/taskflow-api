// ═══════════════════════════════════════════
// Tasks Controller — CRUD operations
// ═══════════════════════════════════════════

import prisma from '../../config/db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { logger } from '../../utils/logger.js';

/**
 * GET /api/v1/tasks
 * USER  → returns own tasks only.
 * ADMIN → returns all tasks (with user info).
 */
export async function getTasks(req, res, next) {
  try {
    const { role, id: userId } = req.user;
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};

    // Non-admins can only see their own tasks
    if (role !== 'ADMIN') {
      where.userId = userId;
    }

    // Optional status filter
    if (status && ['PENDING', 'IN_PROGRESS', 'DONE'].includes(status)) {
      where.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.task.count({ where }),
    ]);

    return sendSuccess(res, 'Tasks retrieved successfully.', {
      tasks,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/tasks
 * Create a new task for the logged-in user.
 */
export async function createTask(req, res, next) {
  try {
    const { title, description, status } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || 'PENDING',
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Task created: ${task.id} by user ${req.user.id}`);

    return sendSuccess(res, 'Task created successfully.', { task }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/tasks/:id
 * Get a single task — owner or admin only.
 */
export async function getTask(req, res, next) {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      return sendError(res, 'Task not found.', 404);
    }

    // Authorization: owner or admin
    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return sendError(res, 'Access denied.', 403);
    }

    return sendSuccess(res, 'Task retrieved successfully.', { task });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/tasks/:id
 * Update a task — owner or admin only.
 */
export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;

    // Check existence and ownership
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Task not found.', 404);
    }
    if (req.user.role !== 'ADMIN' && existing.userId !== req.user.id) {
      return sendError(res, 'Access denied.', 403);
    }

    const { title, description, status } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`Task updated: ${task.id} by user ${req.user.id}`);

    return sendSuccess(res, 'Task updated successfully.', { task });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/tasks/:id
 * Delete a task — owner or admin only.
 */
export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Task not found.', 404);
    }
    if (req.user.role !== 'ADMIN' && existing.userId !== req.user.id) {
      return sendError(res, 'Access denied.', 403);
    }

    await prisma.task.delete({ where: { id } });

    logger.info(`Task deleted: ${id} by user ${req.user.id}`);

    return sendSuccess(res, 'Task deleted successfully.');
  } catch (error) {
    next(error);
  }
}
