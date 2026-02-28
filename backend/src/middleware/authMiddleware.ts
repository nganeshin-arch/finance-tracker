import { Request, Response, NextFunction, RequestHandler } from 'express';
import authService from '../services/authService';

/**
 * Extended Request interface with user information
 */
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: 'user' | 'admin';
  };
}

/**
 * Middleware to authenticate JWT token
 * Verifies the token from Authorization header and attaches user info to request
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    // Check if token exists
    if (!token) {
      console.warn('[AuthMiddleware] No token provided');
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    (req as AuthRequest).user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    // Handle token verification errors
    if (error instanceof Error) {
      if (error.message === 'Session expired') {
        console.warn('[AuthMiddleware] Token expired');
        res.status(401).json({ error: 'Session expired' });
        return;
      } else if (error.message === 'Invalid token') {
        console.warn('[AuthMiddleware] Invalid token');
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
    }

    console.error('[AuthMiddleware] Authentication failed:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware factory to authorize specific roles
 * Returns a middleware that checks if the authenticated user has one of the required roles
 * 
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 * 
 * @example
 * router.get('/admin/users', authenticateToken, authorizeRole('admin'), getUsersHandler)
 */
export function authorizeRole(...roles: Array<'user' | 'admin'>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthRequest;

      // Check if user is authenticated
      if (!authReq.user) {
        console.warn('[AuthMiddleware] Authorization check without authenticated user');
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if user has required role
      if (!roles.includes(authReq.user.role)) {
        console.warn(`[AuthMiddleware] User ${authReq.user.userId} with role ${authReq.user.role} attempted to access route requiring roles: ${roles.join(', ')}`);
        res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.' 
        });
        return;
      }

      next();
    } catch (error) {
      console.error('[AuthMiddleware] Authorization error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}
