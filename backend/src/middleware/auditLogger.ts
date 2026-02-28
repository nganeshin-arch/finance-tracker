import { Request, Response, NextFunction } from 'express';
import { logger, LogAction } from '../utils/logger';
import { AuthRequest } from './authMiddleware';
import { UserContextRequest } from './userContext';

/**
 * Middleware to log all data access attempts
 * Automatically logs API requests with user context, resource, and action
 */
export function auditLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  
  // Extract user information if available
  const authReq = req as UserContextRequest;
  const userId = authReq.userContext?.userId || authReq.user?.userId;
  
  // Extract request details
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  
  // Determine action based on HTTP method
  let action: LogAction;
  switch (method) {
    case 'GET':
      action = LogAction.READ;
      break;
    case 'POST':
      action = LogAction.CREATE;
      break;
    case 'PUT':
    case 'PATCH':
      action = LogAction.UPDATE;
      break;
    case 'DELETE':
      action = LogAction.DELETE;
      break;
    default:
      action = LogAction.READ;
  }
  
  // Extract resource from path
  const resource = extractResourceFromPath(path);
  const resourceId = extractResourceIdFromPath(path);
  
  // Log the access attempt
  if (userId) {
    logger.logDataAccess(action, userId, resource, resourceId, {
      method,
      path,
      ip,
      userAgent,
      query: req.query,
      body: sanitizeBody(req.body)
    });
  }
  
  // Capture response to log status
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;
    
    // Log failed authorization attempts
    if (res.statusCode === 403) {
      logger.logAuthorizationFailure(
        userId,
        resource,
        action,
        'Access denied',
        ip,
        userAgent
      );
    }
    
    // Log authentication failures
    if (res.statusCode === 401) {
      logger.logAuthenticationFailure(
        req.body?.email || 'unknown',
        'Unauthorized access attempt',
        ip,
        userAgent
      );
    }
    
    // Log general info
    console.log(
      `[Audit] ${method} ${path} - Status: ${res.statusCode} - Duration: ${duration}ms - User: ${userId || 'anonymous'}`
    );
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Extract resource name from API path
 */
function extractResourceFromPath(path: string): string {
  // Remove /api/ prefix and extract first segment
  const segments = path.replace(/^\/api\//, '').split('/');
  return segments[0] || 'unknown';
}

/**
 * Extract resource ID from path if present
 */
function extractResourceIdFromPath(path: string): string | undefined {
  // Look for numeric ID in path segments
  const segments = path.split('/');
  const idSegment = segments.find(segment => /^\d+$/.test(segment));
  return idSegment;
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'password_hash', 'token', 'secret'];
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}
