import { Request, Response, NextFunction } from 'express';
import { UserContext } from '../types/models';
import { AuthRequest } from './authMiddleware';

/**
 * Extended Request interface with user context
 */
export interface UserContextRequest extends AuthRequest {
  userContext?: UserContext;
}

/**
 * Middleware to attach user context to request
 * Extracts user information from authenticated request and creates a UserContext
 * 
 * This middleware should be applied AFTER authenticateToken middleware
 * It provides a consistent user context interface for all downstream handlers
 * 
 * @example
 * router.get('/transactions', authenticateToken, attachUserContext, getTransactionsHandler)
 */
export function attachUserContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authReq = req as AuthRequest;

    // Check if user is authenticated
    if (!authReq.user) {
      console.warn('[UserContext] No authenticated user found');
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Create user context from authenticated user
    const userContext: UserContext = {
      userId: authReq.user.userId,
      email: '', // Email will be populated if needed, or we can fetch it
      role: authReq.user.role
    };

    // Attach user context to request
    (req as UserContextRequest).userContext = userContext;

    console.log(`[UserContext] User context attached for user ${userContext.userId} (${userContext.role})`);
    next();
  } catch (error) {
    console.error('[UserContext] Failed to attach user context:', error);
    res.status(500).json({ error: 'Failed to process user context' });
  }
}
