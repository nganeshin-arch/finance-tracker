import { Request, Response, NextFunction } from 'express';
import transactionService from '../services/transactionService';
import { TransactionFilters } from '../types/filters';
import { UserContextRequest } from '../middleware/userContext';

/**
 * Controller for transaction endpoints
 */
export class TransactionController {
  /**
   * GET /api/transactions
   * Get all transactions with optional filtering
   */
  async getAllTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userContextReq = req as UserContextRequest;
      
      // Extract userId from userContext (set by attachUserContext middleware)
      if (!userContextReq.userContext?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }
      
      const userId = userContextReq.userContext.userId;

      const filters: TransactionFilters = {};

      // Parse query parameters
      if (req.query.startDate) {
        filters.startDate = req.query.startDate as string;
      }

      if (req.query.endDate) {
        filters.endDate = req.query.endDate as string;
      }

      if (req.query.trackingCycleId) {
        filters.trackingCycleId = parseInt(req.query.trackingCycleId as string);
      }

      if (req.query.transactionTypeId) {
        filters.transactionTypeId = parseInt(req.query.transactionTypeId as string);
      }

      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }

      if (req.query.accountId) {
        filters.accountId = parseInt(req.query.accountId as string);
      }

      // Get transactions filtered by userId
      const transactions = await transactionService.getTransactions(userId, filters);
      
      // Log access for auditing
      console.log(`[Audit] User ${userId} accessed transactions list with filters:`, filters);
      
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transactions/:id
   * Get transaction by ID
   */
  async getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userContextReq = req as UserContextRequest;
      
      // Extract userId from userContext (set by attachUserContext middleware)
      if (!userContextReq.userContext?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }
      
      const userId = userContextReq.userContext.userId;
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid transaction ID'
        });
        return;
      }

      // Get transaction by ID
      const transaction = await transactionService.getTransactionById(id);
      
      // Verify ownership
      if (transaction.userId !== userId) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Transaction not found'
        });
        return;
      }
      
      // Log access for auditing
      console.log(`[Audit] User ${userId} accessed transaction ${id}`);
      
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/transactions
   * Create a new transaction
   */
  async createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userContextReq = req as UserContextRequest;
      
      // Extract userId from userContext (set by attachUserContext middleware)
      if (!userContextReq.userContext?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }
      
      const userId = userContextReq.userContext.userId;

      // Create transaction with userId
      const transaction = await transactionService.createTransaction(userId, req.body);
      
      // Log creation for auditing
      console.log(`[Audit] User ${userId} created transaction ${transaction.id}`);
      
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/transactions/:id
   * Update a transaction
   */
  async updateTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userContextReq = req as UserContextRequest;
      
      // Extract userId from userContext (set by attachUserContext middleware)
      if (!userContextReq.userContext?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }
      
      const userId = userContextReq.userContext.userId;
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid transaction ID'
        });
        return;
      }

      // Update transaction with ownership check
      const transaction = await transactionService.updateTransaction(userId, id, req.body);
      
      // Log update for auditing
      console.log(`[Audit] User ${userId} updated transaction ${id}`);
      
      res.json(transaction);
    } catch (error) {
      // Handle not found or access denied errors
      if (error instanceof Error && error.message.includes('not found or access denied')) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Transaction not found'
        });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/transactions/:id
   * Delete a transaction
   */
  async deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userContextReq = req as UserContextRequest;
      
      // Extract userId from userContext (set by attachUserContext middleware)
      if (!userContextReq.userContext?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }
      
      const userId = userContextReq.userContext.userId;
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid transaction ID'
        });
        return;
      }

      // Delete transaction with ownership check
      const deleted = await transactionService.deleteTransaction(userId, id);
      
      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Transaction not found'
        });
        return;
      }
      
      // Log deletion for auditing
      console.log(`[Audit] User ${userId} deleted transaction ${id}`);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionController();
