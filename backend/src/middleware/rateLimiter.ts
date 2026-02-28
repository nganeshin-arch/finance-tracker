import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthRequest } from './authMiddleware';

/**
 * Rate limiter configuration
 */
interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  message?: string;      // Custom error message
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  skipFailedRequests?: boolean;      // Don't count failed requests
}

/**
 * Request tracking entry
 */
interface RequestTracker {
  count: number;
  resetTime: number;
}

/**
 * In-memory store for rate limiting
 * In production, consider using Redis for distributed rate limiting
 */
class RateLimitStore {
  private store: Map<string, RequestTracker> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Increment request count for a key
   */
  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const tracker = this.store.get(key);

    if (!tracker || now > tracker.resetTime) {
      // Create new tracker or reset expired one
      const newTracker: RequestTracker = {
        count: 1,
        resetTime: now + windowMs
      };
      this.store.set(key, newTracker);
      return newTracker;
    }

    // Increment existing tracker
    tracker.count++;
    this.store.set(key, tracker);
    return tracker;
  }

  /**
   * Get current count for a key
   */
  get(key: string): RequestTracker | undefined {
    const tracker = this.store.get(key);
    if (tracker && Date.now() <= tracker.resetTime) {
      return tracker;
    }
    return undefined;
  }

  /**
   * Reset count for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, tracker] of this.store.entries()) {
      if (now > tracker.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get store size (for monitoring)
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Generate key based on IP and optionally user ID
    const authReq = req as AuthRequest;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = authReq.user?.userId;
    const key = userId ? `user:${userId}` : `ip:${ip}`;

    // Check current rate limit status
    const tracker = rateLimitStore.increment(key, windowMs);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - tracker.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(tracker.resetTime).toISOString());

    // Check if limit exceeded
    if (tracker.count > maxRequests) {
      // Log rate limit violation
      logger.logRateLimitViolation(ip, req.path, userId);

      res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((tracker.resetTime - Date.now()) / 1000)
      });
      return;
    }

    // Handle skip options
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalSend = res.send;
      res.send = function (data: any): Response {
        const shouldSkip = 
          (skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400);

        if (shouldSkip) {
          // Decrement count if we should skip this request
          const currentTracker = rateLimitStore.get(key);
          if (currentTracker && currentTracker.count > 0) {
            currentTracker.count--;
          }
        }

        return originalSend.call(this, data);
      };
    }

    next();
  };
}

/**
 * Preset rate limiters for common use cases
 */

// General API rate limiter (100 requests per 15 minutes)
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests, please try again later'
});

// Strict rate limiter for authentication endpoints (5 requests per 15 minutes)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true // Only count failed attempts
});

// Moderate rate limiter for data modification (30 requests per minute)
export const writeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many write requests, please slow down'
});

// Lenient rate limiter for read operations (200 requests per minute)
export const readRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 200,
  message: 'Too many read requests, please slow down'
});

/**
 * Export store for testing and monitoring
 */
export { rateLimitStore };
