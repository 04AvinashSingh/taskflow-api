// ═══════════════════════════════════════════
// Auth Controller — register & login
// ═══════════════════════════════════════════

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { logger } from '../../utils/logger.js';

const SALT_ROUNDS = 12;

/**
 * POST /api/v1/auth/register
 * Create a new user account and return a JWT.
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check if email is already taken
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, 'A user with this email already exists.', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User registered: ${user.email}`);

    return sendSuccess(res, 'Registration successful.', { user, token }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 * Authenticate user credentials and return a JWT.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user by email (include password for comparison)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User logged in: ${user.email}`);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return sendSuccess(res, 'Login successful.', { user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
}
