import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/authMiddleware';
import { attachUserContext } from '../middleware/userContext';
import { readRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Dashboard Analytics Routes
 * All routes require authentication and user context
 * Rate limited to prevent abuse
 */

// GET /api/dashboard/summary
router.get('/summary', authenticateToken, attachUserContext, readRateLimiter, dashboardController.getSummary.bind(dashboardController));

// GET /api/dashboard/expenses-by-category
router.get('/expenses-by-category', authenticateToken, attachUserContext, readRateLimiter, dashboardController.getExpensesByCategory.bind(dashboardController));

// GET /api/dashboard/monthly-trend
router.get('/monthly-trend', authenticateToken, attachUserContext, readRateLimiter, dashboardController.getMonthlyTrend.bind(dashboardController));

export default router;
