// ═══════════════════════════════════════════
// Admin Routes — /api/v1/admin
// ═══════════════════════════════════════════

import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { authorizeRole } from '../../middleware/roleCheck.js';
import { getUsers, deleteUser } from './admin.controller.js';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticateToken);
router.use(authorizeRole('ADMIN'));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     description: Returns all registered users with task counts. Admin only.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
 *     description: Permanently removes a user and all their tasks. Admin only.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete yourself
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', deleteUser);

export default router;
