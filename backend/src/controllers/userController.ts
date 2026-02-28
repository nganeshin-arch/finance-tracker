import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { UserContextRequest } from '../middleware/userContext';
import { NotFoundError, ForbiddenError } from '../utils/errors';

/**
 * Controller for user management endpoints (admin only)
 * Requirements: 8.1, 8.3
 */
export class UserController {
  /**
   * GET /api/users
   * Get all users with transaction statistics
   * Admin only
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userContextReq = req as UserContextRequest;
      
      // Verify user context exists
      if (!userContextReq.userContext?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }
      
      // Verify admin role
      userService.verifyAdminAccess(userContextReq.userContext.role);
      
      // Get all users
      const users = await userService.getAllUsers();
      
      // Log access for auditing
      console.log(`[Audit] Admin ${userContextReq.userContext.userId} accessed user list`);
      
      res.json(users);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/users/:id/stats
   * Get detailed statistics for a specific user
   * Admin only
   */
  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userContextReq = req as UserContextRequest;
      
      // Verify user context exists
      if (!userContextReq.userContext?.userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User context not found'
        });
        return;
      }
      
      // Verify admin role
      userService.verifyAdminAccess(userContextReq.userContext.role);
      
      // Parse user ID from params
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid user ID'
        });
        return;
      }
      
      // Get user statistics
      const stats = await userService.getUserStats(userId);
      
      // Log access for auditing
      console.log(`[Audit] Admin ${userContextReq.userContext.userId} accessed stats for user ${userId}`);
      
      res.json(stats);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message
        });
        return;
      }
      next(error);
    }
  }
}

export default new UserController();
