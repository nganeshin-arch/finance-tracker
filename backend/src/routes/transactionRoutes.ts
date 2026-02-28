import { Router } from 'express';
import transactionController from '../controllers/transactionController';
import { authenticateToken } from '../middleware/authMiddleware';
import { attachUserContext } from '../middleware/userContext';
import { readRateLimiter, writeRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Transaction Routes
 * All routes require authentication and user context
 * Rate limited to prevent abuse
 */

// GET /api/transactions
router.get('/', authenticateToken, attachUserContext, readRateLimiter, transactionController.getAllTransactions.bind(transactionController));

// GET /api/transactions/:id
router.get('/:id', authenticateToken, attachUserContext, readRateLimiter, transactionController.getTransactionById.bind(transactionController));

// POST /api/transactions
router.post('/', authenticateToken, attachUserContext, writeRateLimiter, transactionController.createTransaction.bind(transactionController));

// PUT /api/transactions/:id
router.put('/:id', authenticateToken, attachUserContext, writeRateLimiter, transactionController.updateTransaction.bind(transactionController));

// DELETE /api/transactions/:id
router.delete('/:id', authenticateToken, attachUserContext, writeRateLimiter, transactionController.deleteTransaction.bind(transactionController));

export default router;
