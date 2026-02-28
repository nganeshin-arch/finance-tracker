import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { attachUserContext } from '../middleware/userContext';

const router = Router();

/**
 * User Management Routes (Admin Only)
 * All routes require authentication, user context, and admin role
 * Requirements: 8.1, 8.3
 */

// GET /api/users - Get all users with transaction statistics
router.get(
  '/',
  authenticateToken,
  authorizeRole('admin'),
  attachUserContext,
  userController.getAllUsers.bind(userController)
);

// GET /api/users/:id/stats - Get detailed statistics for a specific user
router.get(
  '/:id/stats',
  authenticateToken,
  authorizeRole('admin'),
  attachUserContext,
  userController.getUserStats.bind(userController)
);

export default router;
