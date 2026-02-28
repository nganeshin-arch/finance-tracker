import { UserContext } from './models';

/**
 * Extend Express Request interface to include user context
 * This allows TypeScript to recognize the userContext property on Request objects
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: 'user' | 'admin';
      };
      userContext?: UserContext;
    }
  }
}

export {};
