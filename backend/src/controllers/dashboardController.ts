import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboardService';
import { UserContextRequest } from '../middleware/userContext';

/**
 * Controller for dashboard analytics endpoints
 */
export class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get dashboard summary with total income, expenses, and net balance
   * Query params: trackingCycleId (optional), startDate (optional), endDate (optional)
   */
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract userId from userContext (set by attachUserContext middleware)
      const userContextReq = req as UserContextRequest;
      const userId = userContextReq.userContext?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }

      // Parse date filters from query
      const trackingCycleId = req.query.trackingCycleId 
        ? parseInt(req.query.trackingCycleId as string) 
        : undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      // Validate trackingCycleId if provided
      if (req.query.trackingCycleId && isNaN(trackingCycleId!)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid tracking cycle ID'
        });
        return;
      }

      // Pass userId and filters to service - returns user-specific summary
      const summary = await dashboardService.getSummary(userId, trackingCycleId, startDate, endDate);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/expenses-by-category
   * Get expenses grouped by category with percentages
   * Query params: trackingCycleId (optional), startDate (optional), endDate (optional)
   */
  async getExpensesByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract userId from userContext (set by attachUserContext middleware)
      const userContextReq = req as UserContextRequest;
      const userId = userContextReq.userContext?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }

      // Parse date filters from query
      const trackingCycleId = req.query.trackingCycleId 
        ? parseInt(req.query.trackingCycleId as string) 
        : undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      // Validate trackingCycleId if provided
      if (req.query.trackingCycleId && isNaN(trackingCycleId!)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid tracking cycle ID'
        });
        return;
      }

      // Pass userId to service methods - returns user-specific chart data
      const expenses = await dashboardService.getExpensesByCategory(userId, trackingCycleId, startDate, endDate);
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/monthly-trend
   * Get monthly trend data showing income and expenses over time
   * Query params: months (optional, default: 6)
   */
  async getMonthlyTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract userId from userContext (set by attachUserContext middleware)
      const userContextReq = req as UserContextRequest;
      const userId = userContextReq.userContext?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }

      const months = req.query.months 
        ? parseInt(req.query.months as string) 
        : 6;

      // Validate months parameter
      if (req.query.months && isNaN(months)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid months parameter'
        });
        return;
      }

      // Pass userId to service methods - returns user-specific chart data
      const trend = await dashboardService.getMonthlyTrend(userId, months);
      res.json(trend);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
