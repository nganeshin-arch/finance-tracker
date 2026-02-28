import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Authentication Routes
 * Rate limited to prevent brute force attacks
 */

// POST /api/auth/register
// Register a new user with email and password
router.post(
  '/register',
  authRateLimiter,
  authController.validateRegister,
  authController.register.bind(authController)
);

// POST /api/auth/login
// Login user with email and password
router.post(
  '/login',
  authRateLimiter,
  authController.validateLogin,
  authController.login.bind(authController)
);

// GET /api/auth/me
// Get current authenticated user
// Requires valid JWT token
router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser.bind(authController)
);

export default router;
